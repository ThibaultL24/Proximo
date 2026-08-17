# app/services/social/adapters/tiktok.rb
module Social
  module Adapters
    class Tiktok < Base
      def publish
        return demo_result if use_demo?

        failed("Publication TikTok live non configuree pour la demo (ajoutez TIKTOK_CLIENT_KEY).")
      rescue StandardError => e
        failed(e.message)
      end
    end
  end
end
