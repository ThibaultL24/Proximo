# app/controllers/api/v1/oauth/social_controller.rb
module Api
  module V1
    module Oauth
      class SocialController < ApplicationController
        def callback
          path_hint = params[:provider].to_s
          raw_state = params[:state].to_s

          if params[:error].present?
            provider = provider_from_state(raw_state) || normalize_path_provider(path_hint) || "unknown"
            return redirect_frontend(provider, "error", params[:error_description].presence || params[:error])
          end

          if params[:code].blank? || raw_state.blank?
            Rails.logger.warn("[SocialOAuth] Callback sans code/state path=#{path_hint} params=#{params.to_unsafe_h.except('controller', 'action')}")
            return redirect_frontend(
              normalize_path_provider(path_hint) || "facebook",
              "error",
              "Connexion Meta incomplète (pas de code OAuth). Relancez Connecter depuis Publier — ne testez pas l’URL de callback à la main."
            )
          end

          provider, signed = parse_state(raw_state, path_hint)
          provider = normalize_path_provider(provider) || provider

          unless Social::Config.v1_provider?(provider)
            return redirect_frontend(provider.presence || "unknown", "error", "Réseau non supporté (#{provider})")
          end

          payload = Social::OauthState.verify(signed)
          return redirect_frontend(provider, "error", "Session OAuth expirée — reconnectez") unless payload

          # Le state signé porte le vrai provider (facebook / instagram)
          provider = payload["provider"].to_s if payload["provider"].present?
          unless Social::Config.v1_provider?(provider)
            return redirect_frontend("unknown", "error", "Réseau non supporté")
          end

          merchant = ::Merchant.find_by(id: payload["merchant_id"])
          return redirect_frontend(provider, "error", "Commerçant introuvable") unless merchant

          tokens = Social::Oauth.exchange_code(provider, params[:code])
          account = merchant.social_accounts.find_or_initialize_by(provider: provider)
          account.assign_attributes(
            account_name: tokens[:account_name],
            access_token: tokens[:access_token],
            refresh_token: tokens[:refresh_token],
            external_id: tokens[:external_id],
            status: :connected,
            connected_at: Time.current
          )
          account.save!

          redirect_frontend(provider, "ok")
        rescue StandardError => e
          Rails.logger.error("[SocialOAuth] #{e.class}: #{e.message}")
          hint = provider_from_state(params[:state].to_s) || normalize_path_provider(params[:provider].to_s) || "facebook"
          redirect_frontend(hint, "error", e.message)
        end

        private

        def parse_state(raw_state, provider_from_path)
          # Formats acceptés :
          # - "facebook:<signed>" / "instagram:<signed>"
          # - "<signed>" seul (provider lu dans le payload après verify)
          if raw_state.match?(/\A(facebook|instagram|linkedin):/)
            provider, signed = raw_state.split(":", 2)
            [provider, signed]
          else
            [normalize_path_provider(provider_from_path) || provider_from_path, raw_state]
          end
        end

        def provider_from_state(raw_state)
          return nil if raw_state.blank?
          return Regexp.last_match(1) if raw_state.match?(/\A(facebook|instagram|linkedin):/)

          payload = Social::OauthState.verify(
            raw_state.match?(/\A(facebook|instagram|linkedin):/) ? raw_state.split(":", 2).last : raw_state
          )
          payload && payload["provider"]
        rescue StandardError
          nil
        end

        def normalize_path_provider(value)
          case value.to_s
          when "meta", "facebook"
            # meta = callback partagé FB/IG ; défaut facebook si state illisible
            value.to_s == "meta" ? nil : "facebook"
          when "instagram" then "instagram"
          when "linkedin" then "linkedin"
          else
            Social::Config.v1_provider?(value) ? value.to_s : nil
          end
        end

        def redirect_frontend(provider, status, message = nil)
          query = { social: provider, status: status }
          query[:message] = message if message.present?
          redirect_to "#{Social::Config.frontend_url}/espace-commercant/publier?#{query.to_query}", allow_other_host: true
        end
      end
    end
  end
end
