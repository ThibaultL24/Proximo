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
        posted = client.publish!(title: title.presence || "Actualité locale", html: paragraphs.join("\n"))
        Result.new(status: :published, external_post_id: posted.fetch("id").to_s, error_message: nil)
      rescue WordpressClient::Error => e
        failed(e.message)
      end
    end
  end
end
