# Client WordPress auto-hébergé, utilisant uniquement l'API officielle.
# Les connexions HTTPS sortantes sont limitées aux domaines publics, sans
# redirection et avec IP DNS épinglée afin de bloquer les accès réseau internes.
require "net/http"
require "uri"
require "json"
require "resolv"
require "ipaddr"
require "openssl"
require "base64"

module Social
  class WordpressClient
    class Error < StandardError; end

    BLOCKED_NETWORKS = %w[
      0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8
      169.254.0.0/16 172.16.0.0/12 192.0.0.0/24
      192.0.2.0/24 192.168.0.0/16 198.18.0.0/15
      198.51.100.0/24 203.0.113.0/24 224.0.0.0/4 240.0.0.0/4
      ::/128 ::1/128 ::ffff:0:0/96 fc00::/7 fe80::/10
      2001:db8::/32 ff00::/8
    ].map { |network| IPAddr.new(network) }.freeze
    RESERVED_DOMAINS = %w[local localhost internal invalid example test].freeze

    attr_reader :site_url

    def initialize(site_url:, username:, application_password:, resolver: Resolv)
      @site_url = self.class.normalize_url(site_url)
      @uri = URI.parse(@site_url)
      @username = username.to_s.strip
      @application_password = application_password.to_s.strip
      @resolver = resolver
      raise Error, "Identifiants WordPress manquants" if @username.blank? || @application_password.blank?
    end

    def self.normalize_url(url)
      uri = URI.parse(url.to_s.strip)
      host = uri.host.to_s.downcase
      unless uri.scheme == "https" && uri.port == 443 &&
             uri.userinfo.nil? && uri.query.nil? && uri.fragment.nil? &&
             (uri.path.blank? || uri.path == "/") &&
             host.match?(/\A[a-z0-9-]+(?:\.[a-z0-9-]+)+\z/) &&
             host.split(".").none?(&:blank?) &&
             host.split(".").last.match?(/\A[a-z]{2,}\z/) &&
             !RESERVED_DOMAINS.include?(host.split(".").last)
        raise Error, "Utilisez l'adresse HTTPS publique du site WordPress, sans chemin ni port personnalisé"
      end

      "https://#{host}"
    rescue URI::InvalidURIError, ArgumentError
      raise Error, "Adresse WordPress invalide"
    end

    def verify!
      result = request(:get, "/wp-json/wp/v2/users/me?context=edit")
      raise Error, "WordPress ne reconnaît pas cet utilisateur" if result["id"].blank?
      result.slice("id", "name", "slug")
    end

    def publish!(title:, html:)
      result = request(:post, "/wp-json/wp/v2/posts", {
        title: title, content: html, status: "publish"
      })
      raise Error, "WordPress n'a pas renvoyé de référence de publication" if result["id"].blank?
      unless result["status"] == "publish"
        raise Error, "WordPress n'a pas confirmé la publication publique"
      end

      result.slice("id", "link", "status")
    end

    private

    def request(method, path, payload = nil)
      addresses = @resolver.getaddresses(@uri.host)
      if addresses.blank? || addresses.any? { |ip| !public_ip?(ip) }
        raise Error, "Le domaine ne résout pas vers une adresse Internet publique"
      end

      # Le hostname sert à la validation TLS et au Host/SNI, tandis que
      # ipaddr fixe la destination TCP sur l'adresse DNS déjà contrôlée.
      http = Net::HTTP.new(@uri.host, 443, nil)
      http.ipaddr = addresses.first
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      http.open_timeout = 5
      http.read_timeout = 12
      http.write_timeout = 12

      req = method == :get ? Net::HTTP::Get.new(path) : Net::HTTP::Post.new(path)
      req.basic_auth(@username, @application_password)
      if payload
        req["Content-Type"] = "application/json"
        req.body = JSON.generate(payload)
      end

      response = http.request(req)
      # Ne jamais suivre un 3xx : la destination pourrait devenir interne
      # ou transférer les identifiants vers un autre domaine.
      raise Error, "Redirection WordPress refusée" if response.is_a?(Net::HTTPRedirection)

      case response.code.to_i
      when 200..299
        JSON.parse(response.body.to_s)
      when 401, 403
        raise Error, "WordPress a refusé l'autorisation du compte"
      else
        raise Error, "WordPress a refusé l'opération (HTTP #{response.code})"
      end
    rescue SocketError, Timeout::Error, Errno::ECONNREFUSED, OpenSSL::SSL::SSLError
      raise Error, "Site WordPress inaccessible via HTTPS"
    rescue JSON::ParserError
      raise Error, "Réponse WordPress non valide"
    end

    def public_ip?(ip)
      address = IPAddr.new(ip)
      !BLOCKED_NETWORKS.any? { |network| network.include?(address) }
    rescue IPAddr::InvalidAddressError
      false
    end
  end
end
