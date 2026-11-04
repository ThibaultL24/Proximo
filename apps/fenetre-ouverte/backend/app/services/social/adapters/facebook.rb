# app/services/social/adapters/facebook.rb
module Social
  module Adapters
    class Facebook < Base
      def publish
        return demo_result if use_demo?

        page_id = account.external_id
        token = account.access_token
        raise "Page Facebook manquante" if page_id.blank?

        data =
          if image_io.present?
            post_multipart(
              "https://graph.facebook.com/v21.0/#{page_id}/photos",
              fields: { caption: body, access_token: token },
              file_field: "source",
              filename: image_filename.presence || "photo.jpg",
              content_type: image_content_type.presence || "image/jpeg",
              io: image_io
            )
          elsif public_image_url?
            post_form(
              "https://graph.facebook.com/v21.0/#{page_id}/photos",
              { url: image_url, caption: body, access_token: token }
            )
          else
            post_form(
              "https://graph.facebook.com/v21.0/#{page_id}/feed",
              { message: body, access_token: token }
            )
          end

        Result.new(status: :published, external_post_id: data["id"] || data["post_id"], error_message: nil)
      rescue StandardError => e
        failed(e.message)
      end
    end
  end
end
