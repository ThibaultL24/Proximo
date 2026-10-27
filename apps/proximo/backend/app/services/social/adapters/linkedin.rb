# app/services/social/adapters/linkedin.rb
module Social
  module Adapters
    class Linkedin < Base
      def publish
        return demo_result if use_demo?

        person_urn = "urn:li:person:#{account.external_id}"
        payload = {
          author: person_urn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent" => {
              shareCommentary: { text: body },
              shareMediaCategory: image_url.present? ? "NONE" : "NONE"
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility" => "PUBLIC"
          }
        }

        # V1: text-only UGC; image upload via LinkedIn Assets API comes later
        data = post_json(
          "https://api.linkedin.com/v2/ugcPosts",
          payload,
          headers: {
            "Authorization" => "Bearer #{account.access_token}",
            "X-Restli-Protocol-Version" => "2.0.0"
          }
        )

        Result.new(status: :published, external_post_id: data["id"], error_message: nil)
      rescue StandardError => e
        failed(e.message)
      end
    end
  end
end
