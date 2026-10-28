# app/controllers/api/v1/platform/integrations_controller.rb
module Api
  module V1
    module Platform
      class IntegrationsController < ApplicationController
        before_action :authenticate_super_admin!

        def show
          render json: payload
        end

        def update
          PlatformIntegrationSettings.update!(integration_params)
          render json: payload
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        private

        def payload
          settings = PlatformIntegrationSettings.public_payload
          {
            **settings,
            meta: integration_status(
              label: "Meta (Facebook / Instagram)",
              configured: Social::Config.meta_configured?,
              app_id: settings[:meta_app_id],
              secret_configured: settings[:meta_app_secret_configured],
              secret_source: settings[:meta_app_secret_source],
              redirect_uri: settings[:meta_redirect_uri]
            ),
            tiktok: integration_status(
              label: "TikTok",
              configured: Social::Config.tiktok_configured?,
              app_id: settings[:tiktok_client_key],
              secret_configured: settings[:tiktok_client_secret_configured],
              secret_source: settings[:tiktok_client_secret_source],
              redirect_uri: settings[:tiktok_redirect_uri]
            ),
            providers: Social::Config::V1_PROVIDERS,
            demo_mode: !Social::Config.meta_configured? && !Social::Config.tiktok_configured?
          }
        end

        def integration_status(label:, configured:, app_id:, secret_configured:, secret_source:, redirect_uri:)
          {
            label: label,
            configured: configured,
            mode: configured ? "oauth" : "demo",
            app_id: app_id,
            secret_configured: secret_configured,
            secret_source: secret_source,
            redirect_uri: redirect_uri
          }
        end

        def integration_params
          params.require(:integration).permit(
            :frontend_url, :backend_url,
            :meta_app_id, :meta_app_secret, :meta_redirect_uri, :meta_login_config_id,
            :tiktok_client_key, :tiktok_client_secret, :tiktok_redirect_uri
          )
        end
      end
    end
  end
end
