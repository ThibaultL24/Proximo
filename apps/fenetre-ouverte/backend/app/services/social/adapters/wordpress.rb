require "cgi"

module Social
  module Adapters
    class Wordpress < Base
      def publish
        return failed("Connexion WordPress absente") if account.external_id.blank?
        return failed("Identifiants WordPress manquants") if account.account_name.blank? || account.access_token.blank?

        client = WordpressClient.new(
          site_url: account.external_id,
          username: account.account_name,
          application_password: account.access_token
        )
        title = body.to_s.lines.first.to_s.strip.truncate(100, omission: "…")
        paragraphs = body.to_s.strip.split(/\n\s*\n/).map do |paragraph|
          "<p>#{CGI.escapeHTML(paragraph).gsub("\n", "<br>")}</p>"
        end
        html = paragraphs.join("\n")
        if public_image_url?
          # L'image est affichée via son URL HTTPS Fenêtre Ouverte.
          # Pas d'import WordPress Media tant que les droits et quotas ne sont pas validés.
          src = CGI.escapeHTML(image_url)
          html = %(<figure><img src="#{src}" alt="Illustration de la publication locale" loading="lazy"></figure>\n) + html
        end

        posted = client.publish!(
          title: title.presence || "Actualité locale", html: html, slug: delivery_slug
        )
        url = posted["link"].to_s
        url = nil unless url.start_with?("https://")
        Result.new(status: :published, external_post_id: posted.fetch("id").to_s,
                   external_url: url, error_message: nil)
      rescue WordpressClient::DeliveryUncertain => e
        Result.new(status: :uncertain, external_post_id: nil, external_url: nil, error_message: e.message)
      rescue WordpressClient::Error => e
        failed(e.message)
      end
    end
  end
end
