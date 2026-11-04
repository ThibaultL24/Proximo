# app/services/platform_integration_settings.rb
class PlatformIntegrationSettings
  ASSIGNABLE = %i[
    frontend_url backend_url meta_app_id meta_redirect_uri meta_login_config_id
    tiktok_client_key tiktok_redirect_uri
  ].freeze

  class << self
    def store
      PlatformIntegration.instance
    end

    def frontend_url
      store.frontend_url.presence || ENV["FRONTEND_URL"].presence
    end

    def backend_url
      store.backend_url.presence || ENV["BACKEND_URL"].presence
    end

    def meta_app_id
      store.meta_app_id.presence || ENV["META_APP_ID"].presence
    end

    def meta_app_secret
      store.meta_app_secret.presence || ENV["META_APP_SECRET"].presence
    end

    def meta_redirect_uri
      store.meta_redirect_uri.presence || ENV["META_REDIRECT_URI"].presence
    end

    def meta_login_config_id
      store.meta_login_config_id.presence || ENV["META_LOGIN_CONFIG_ID"].presence
    end

    def tiktok_client_key
      store.tiktok_client_key.presence || ENV["TIKTOK_CLIENT_KEY"].presence
    end

    def tiktok_client_secret
      store.tiktok_client_secret.presence || ENV["TIKTOK_CLIENT_SECRET"].presence
    end

    def tiktok_redirect_uri
      store.tiktok_redirect_uri.presence || ENV["TIKTOK_REDIRECT_URI"].presence
    end

    def meta_secret_source
      secret_source(store.meta_app_secret_ciphertext.present?, "META_APP_SECRET")
    end

    def tiktok_secret_source
      secret_source(store.tiktok_client_secret_ciphertext.present?, "TIKTOK_CLIENT_SECRET")
    end

    def update!(attrs)
      record = store
      payload = attrs.to_h.symbolize_keys

      record.meta_app_secret = payload[:meta_app_secret] if payload[:meta_app_secret].present?
      record.tiktok_client_secret = payload[:tiktok_client_secret] if payload[:tiktok_client_secret].present?

      ASSIGNABLE.each do |key|
        record[key] = payload[key] if payload.key?(key)
      end

      record.save!
      record
    end

    def public_payload
      record = store
      {
        frontend_url: effective_frontend_url,
        backend_url: effective_backend_url,
        meta_app_id: meta_app_id,
        meta_app_secret_configured: meta_app_secret.present?,
        meta_app_secret_source: meta_secret_source,
        meta_redirect_uri: meta_redirect_uri || default_meta_redirect_uri,
        meta_login_config_id: meta_login_config_id,
        tiktok_client_key: tiktok_client_key,
        tiktok_client_secret_configured: tiktok_client_secret.present?,
        tiktok_client_secret_source: tiktok_secret_source,
        tiktok_redirect_uri: tiktok_redirect_uri || default_tiktok_redirect_uri,
        form: {
          frontend_url: record.frontend_url.to_s,
          backend_url: record.backend_url.to_s,
          meta_app_id: record.meta_app_id.to_s,
          meta_redirect_uri: record.meta_redirect_uri.to_s,
          meta_login_config_id: record.meta_login_config_id.to_s,
          tiktok_client_key: record.tiktok_client_key.to_s,
          tiktok_redirect_uri: record.tiktok_redirect_uri.to_s
        }
      }
    end

    def effective_frontend_url
      frontend_url.presence || (Rails.env.development? ? "http://localhost:5173" : AppUrls::DEMO_FRONTEND_URL)
    end

    def effective_backend_url
      backend_url.presence || (Rails.env.development? ? "http://127.0.0.1:3000" : effective_frontend_url)
    end

    def default_meta_redirect_uri
      "#{effective_backend_url}/api/v1/oauth/social/meta/callback"
    end

    def default_tiktok_redirect_uri
      "#{effective_backend_url}/api/v1/oauth/social/tiktok/callback"
    end

    private

    def secret_source(stored, env_key)
      return "database" if stored
      return "env" if ENV[env_key].present?

      "none"
    end
  end
end
