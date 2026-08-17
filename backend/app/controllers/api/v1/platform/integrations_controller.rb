# app/controllers/api/v1/platform/integrations_controller.rb
module Api
  module V1
    module Platform
      class IntegrationsController < ApplicationController
        before_action :authenticate_super_admin!

        def show
          render json: {
            frontend_url: AppUrls.frontend_url,
            meta: integration_status(
              label: "Meta (Facebook / Instagram)",
              configured: Social::Config.meta_configured?,
              env_keys: %w[META_APP_ID META_APP_SECRET META_REDIRECT_URI META_LOGIN_CONFIG_ID]
            ),
            tiktok: integration_status(
              label: "TikTok",
              configured: Social::Config.tiktok_configured?,
              env_keys: %w[TIKTOK_CLIENT_KEY TIKTOK_CLIENT_SECRET TIKTOK_REDIRECT_URI]
            ),
            providers: Social::Config::V1_PROVIDERS,
            demo_mode: !Social::Config.meta_configured? && !Social::Config.tiktok_configured?
          }
        end

        private

        def integration_status(label:, configured:, env_keys:)
          {
            label: label,
            configured: configured,
            mode: configured ? "oauth" : "demo",
            env_keys: env_keys
          }
        end
      end
    end
  end
end
