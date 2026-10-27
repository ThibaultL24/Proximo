# app/services/social/adapters/instagram.rb
module Social
  module Adapters
    class Instagram < Base
      def publish
        return demo_result if use_demo?

        ig_user_id = account.external_id
        token = account.access_token
        raise "Compte Instagram manquant" if ig_user_id.blank?

        unless public_image_url?
          return failed(
            "Instagram exige une URL d'image publique (HTTPS). En local, utilise un tunnel (ngrok) et BACKEND_URL=https://...."
          )
        end

        creation = post_form(
          "https://graph.facebook.com/v21.0/#{ig_user_id}/media",
          { image_url: image_url, caption: body, access_token: token }
        )
        creation_id = creation["id"]
        raise "Création média Instagram échouée" if creation_id.blank?

        published = post_form(
          "https://graph.facebook.com/v21.0/#{ig_user_id}/media_publish",
          { creation_id: creation_id, access_token: token }
        )

        Result.new(status: :published, external_post_id: published["id"], error_message: nil)
      rescue StandardError => e
        failed(e.message)
      end
    end
  end
end
