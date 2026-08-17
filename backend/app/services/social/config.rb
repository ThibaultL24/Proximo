# app/services/social/config.rb
module Social
  module Config
    V1_PROVIDERS = %w[facebook instagram linkedin].freeze

    PROVIDER_LIMITS = {
      "facebook" => 500,
      "instagram" => 2_200,
      "linkedin" => 3_000
    }.freeze

    module_function

    def v1_provider?(provider)
      V1_PROVIDERS.include?(provider.to_s)
    end

    def configured?(provider)
      case provider.to_s
      when "facebook", "instagram"
        meta_configured?
      when "linkedin"
        linkedin_configured?
      else
        false
      end
    end

    def meta_configured?
      ENV["META_APP_ID"].present? && ENV["META_APP_SECRET"].present?
    end

    def linkedin_configured?
      ENV["LINKEDIN_CLIENT_ID"].present? && ENV["LINKEDIN_CLIENT_SECRET"].present?
    end

    def backend_url
      ENV.fetch("BACKEND_URL", "http://127.0.0.1:3000").to_s.chomp("/")
    end

    def frontend_url
      ENV.fetch("FRONTEND_URL", "http://localhost:5173").to_s.chomp("/")
    end

    def meta_redirect_uri
      ENV.fetch("META_REDIRECT_URI", "#{backend_url}/api/v1/oauth/social/meta/callback")
    end

    def linkedin_redirect_uri
      ENV.fetch("LINKEDIN_REDIRECT_URI", "#{backend_url}/api/v1/oauth/social/linkedin/callback")
    end

    def char_limit(provider)
      PROVIDER_LIMITS.fetch(provider.to_s, 500)
    end
  end
end
