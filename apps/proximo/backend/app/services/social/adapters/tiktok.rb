# app/services/social/adapters/tiktok.rb
module Social
  module Adapters
    class Tiktok < Base
      INIT_URL = "https://open.tiktokapis.com/v2/post/publish/content/init/"

      def publish
        return demo_result if use_demo?

        unless public_image_url?
          return failed(
            "TikTok live exige une photo en HTTPS public. En local, utilisez un tunnel et BACKEND_URL=https://...."
          )
        end

        data = post_json(
          INIT_URL,
          payload,
          headers: {
            "Authorization" => "Bearer #{account.access_token}"
          }
        )
        error = data["error"] || {}
        unless error["code"].to_s == "ok" || data["data"].present?
          raise error["message"].presence || data["message"] || "Publication TikTok echouee"
        end

        Result.new(
          status: :published,
          external_post_id: data.dig("data", "publish_id") || data.dig("data", "share_id"),
          error_message: nil
        )
      rescue StandardError => e
        failed(e.message)
      end

      private

      def payload
        {
          post_info: {
            title: body.to_s.truncate(90, omission: "…"),
            description: body.to_s.truncate(2_200, omission: "…"),
            disable_comment: false,
            privacy_level: "PUBLIC_TO_EVERYONE",
            auto_add_music: true
          },
          source_info: {
            source: "PULL_FROM_URL",
            photo_cover_index: 0,
            photo_images: [image_url]
          },
          post_mode: "DIRECT_POST",
          media_type: "PHOTO"
        }
      end
    end
  end
end
