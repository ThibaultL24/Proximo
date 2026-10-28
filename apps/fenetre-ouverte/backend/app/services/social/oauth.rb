# app/services/social/oauth.rb
require "net/http"
require "uri"
require "json"
require "cgi"

module Social
  module Oauth
    module_function

    def authorize_url(provider, state)
      case provider.to_s
      when "facebook", "instagram"
        meta_authorize_url(state, provider)
      when "tiktok"
        tiktok_authorize_url(state)
      when "linkedin"
        linkedin_authorize_url(state)
      else
        raise ArgumentError, "Provider inconnu: #{provider}"
      end
    end

    def exchange_code(provider, code)
      case provider.to_s
      when "facebook", "instagram"
        exchange_meta(code, provider)
      when "tiktok"
        exchange_tiktok(code)
      when "linkedin"
        exchange_linkedin(code)
      else
        raise ArgumentError, "Provider inconnu: #{provider}"
      end
    end

    def meta_authorize_url(state, provider)
      app_id = PlatformIntegrationSettings.meta_app_id
      raise "META_APP_ID manquant" if app_id.blank?

      params = {
        client_id: app_id,
        redirect_uri: Config.meta_redirect_uri,
        state: "#{provider}:#{state}",
        response_type: "code"
      }

      config_id = PlatformIntegrationSettings.meta_login_config_id.presence
      if config_id
        params[:config_id] = config_id
      else
        scopes =
          if provider.to_s == "instagram"
            %w[
              public_profile
              pages_show_list
              pages_read_engagement
              pages_manage_posts
              business_management
              instagram_basic
              instagram_content_publish
            ]
          else
            %w[
              public_profile
              pages_show_list
              pages_read_engagement
              pages_manage_posts
              business_management
            ]
          end
        params[:scope] = scopes.join(",")
      end

      "https://www.facebook.com/v21.0/dialog/oauth?#{URI.encode_www_form(params)}"
    end

    def tiktok_authorize_url(state)
      client_key = PlatformIntegrationSettings.tiktok_client_key
      raise "TIKTOK_CLIENT_KEY manquant" if client_key.blank?

      params = {
        client_key: client_key,
        redirect_uri: Config.tiktok_redirect_uri,
        state: "tiktok:#{state}",
        response_type: "code",
        scope: "user.info.basic,user.info.profile,video.upload,video.publish"
      }
      "https://www.tiktok.com/v2/auth/authorize/?#{URI.encode_www_form(params)}"
    end

    def linkedin_authorize_url(state)
      params = {
        response_type: "code",
        client_id: ENV.fetch("LINKEDIN_CLIENT_ID"),
        redirect_uri: Config.linkedin_redirect_uri,
        state: "linkedin:#{state}",
        scope: "openid profile w_member_social"
      }
      "https://www.linkedin.com/oauth/v2/authorization?#{URI.encode_www_form(params)}"
    end

    def exchange_meta(code, provider)
      app_id = PlatformIntegrationSettings.meta_app_id
      app_secret = PlatformIntegrationSettings.meta_app_secret
      raise "META_APP_ID manquant" if app_id.blank?
      raise "META_APP_SECRET manquant" if app_secret.blank?

      token_uri = URI("https://graph.facebook.com/v21.0/oauth/access_token")
      token_uri.query = URI.encode_www_form(
        client_id: app_id,
        client_secret: app_secret,
        redirect_uri: Config.meta_redirect_uri,
        code: code
      )
      token_data = get_json(token_uri)
      user_token = token_data["access_token"]
      raise "Token Meta manquant" if user_token.blank?

      pages = get_json(URI("https://graph.facebook.com/v21.0/me/accounts?access_token=#{CGI.escape(user_token)}"))
      page = pages["data"]&.first
      raise "Aucune page Facebook trouvée" unless page

      if provider.to_s == "instagram"
        ig = get_json(URI(
          "https://graph.facebook.com/v21.0/#{page['id']}?fields=instagram_business_account&access_token=#{CGI.escape(page['access_token'])}"
        ))
        ig_id = ig.dig("instagram_business_account", "id")
        raise "Aucun compte Instagram Business lié à la page" if ig_id.blank?

        {
          access_token: page["access_token"],
          refresh_token: nil,
          external_id: ig_id,
          account_name: page["name"].to_s
        }
      else
        {
          access_token: page["access_token"],
          refresh_token: nil,
          external_id: page["id"],
          account_name: page["name"].to_s
        }
      end
    end

    def exchange_tiktok(code)
      client_key = PlatformIntegrationSettings.tiktok_client_key
      client_secret = PlatformIntegrationSettings.tiktok_client_secret
      raise "TIKTOK_CLIENT_KEY manquant" if client_key.blank?
      raise "TIKTOK_CLIENT_SECRET manquant" if client_secret.blank?

      res = post_form(URI("https://open.tiktokapis.com/v2/oauth/token/"), {
        client_key: client_key,
        client_secret: client_secret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: Config.tiktok_redirect_uri
      })
      token = res["access_token"].presence || res.dig("data", "access_token")
      raise tiktok_error_message(res, "Token TikTok manquant") if token.blank?

      me = get_json(
        URI("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url"),
        headers: { "Authorization" => "Bearer #{token}" }
      )
      user = me.dig("data", "user") || {}
      open_id = res["open_id"].presence || res.dig("data", "open_id") || user["open_id"]
      raise "open_id TikTok manquant" if open_id.blank?

      {
        access_token: token,
        refresh_token: res["refresh_token"],
        external_id: open_id,
        account_name: user["display_name"].presence || "TikTok"
      }
    end

    def tiktok_error_message(payload, fallback)
      payload["error_description"].presence ||
        payload.dig("error", "message").presence ||
        payload["error"].presence ||
        fallback
    end

    def exchange_linkedin(code)
      uri = URI("https://www.linkedin.com/oauth/v2/accessToken")
      res = post_form(uri, {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: Config.linkedin_redirect_uri,
        client_id: ENV.fetch("LINKEDIN_CLIENT_ID"),
        client_secret: ENV.fetch("LINKEDIN_CLIENT_SECRET")
      })
      token = res["access_token"]
      raise "Token LinkedIn manquant" if token.blank?

      me = get_json(URI("https://api.linkedin.com/v2/userinfo"), headers: { "Authorization" => "Bearer #{token}" })
      {
        access_token: token,
        refresh_token: res["refresh_token"],
        external_id: me["sub"],
        account_name: me["name"].presence || me["email"].presence || "LinkedIn"
      }
    end

    def get_json(uri, headers: {})
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      req = Net::HTTP::Get.new(uri)
      headers.each { |k, v| req[k] = v }
      parse_response(http.request(req))
    end

    def post_form(uri, form)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      req = Net::HTTP::Post.new(uri)
      req.set_form_data(form)
      parse_response(http.request(req))
    end

    def parse_response(response)
      body = JSON.parse(response.body.presence || "{}")
      unless response.is_a?(Net::HTTPSuccess)
        message = body["error_description"] || body.dig("error", "message") || body["error"] || response.message
        raise message.to_s
      end
      body
    end
  end
end
