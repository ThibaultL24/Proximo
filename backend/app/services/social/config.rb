# app/services/social/config.rb
module Social
  module Config
    V1_PROVIDERS = %w[facebook instagram tiktok].freeze

    PROVIDER_LIMITS = {
      "facebook" => 500,
      "instagram" => 2_200,
      "tiktok" => 2_200
    }.freeze

    module_function

    def v1_provider?(provider)
      V1_PROVIDERS.include?(provider.to_s)
    end

    def configured?(provider)
      case provider.to_s
      when "facebook", "instagram"
        meta_configured?
      when "tiktok"
        tiktok_configured?
      else
        false
      end
    end

    def meta_configured?
      PlatformIntegrationSettings.meta_app_id.present? &&
        PlatformIntegrationSettings.meta_app_secret.present?
    end

    def tiktok_configured?
      PlatformIntegrationSettings.tiktok_client_key.present? &&
        PlatformIntegrationSettings.tiktok_client_secret.present?
    end

    def tiktok_redirect_uri
      PlatformIntegrationSettings.tiktok_redirect_uri.presence ||
        PlatformIntegrationSettings.default_tiktok_redirect_uri
    end

    def frontend_url
      AppUrls.frontend_url
    end

    def backend_url
      AppUrls.backend_url
    end

    def meta_redirect_uri
      PlatformIntegrationSettings.meta_redirect_uri.presence ||
        PlatformIntegrationSettings.default_meta_redirect_uri
    end

    def linkedin_redirect_uri
      ENV.fetch("LINKEDIN_REDIRECT_URI", "#{backend_url}/api/v1/oauth/social/linkedin/callback")
    end

    def char_limit(provider)
      PROVIDER_LIMITS.fetch(provider.to_s, 500)
    end
  end
end
