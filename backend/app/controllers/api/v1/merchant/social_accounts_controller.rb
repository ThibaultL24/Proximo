# app/controllers/api/v1/merchant/social_accounts_controller.rb
module Api
  module V1
    module Merchant
      class SocialAccountsController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def index
          render json: {
            providers: provider_status,
            accounts: SocialAccountSerializer.new(@merchant.social_accounts.order(:provider)).serializable_hash
          }
        end

        def connect
          provider = params[:provider].to_s
          unless Social::Config.v1_provider?(provider)
            return render json: { error: "Réseau non supporté" }, status: :unprocessable_entity
          end
          unless @merchant.social_page_configured?(provider)
            return render json: { error: "Renseignez d'abord la page #{provider} sur votre fiche commercant" }, status: :unprocessable_entity
          end

          if Social::Config.configured?(provider)
            state = Social::OauthState.generate(merchant_id: @merchant.id, provider: provider)
            url = Social::Oauth.authorize_url(provider, state)
            render json: { mode: "oauth", url: url, provider: provider }
          else
            account = connect_demo!(provider)
            render json: {
              mode: "demo",
              provider: provider,
              account: SocialAccountSerializer.new(account).serializable_hash
            }, status: :created
          end
        end

        def create
          provider = social_account_params[:provider].to_s
          unless Social::Config.v1_provider?(provider)
            return render json: { errors: ["Réseau non supporté"] }, status: :unprocessable_entity
          end

          account = connect_demo!(provider, social_account_params[:account_name])
          render json: SocialAccountSerializer.new(account).serializable_hash, status: :created
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        def destroy
          account = @merchant.social_accounts.find_by!(provider: params[:provider])
          account.destroy!
          head :no_content
        end

        private

        def set_merchant
          return forbidden unless current_user.merchant

          @merchant = current_user.merchant
        end

        def social_account_params
          params.require(:social_account).permit(:provider, :account_name)
        end

        def connect_demo!(provider, account_name = nil)
          label = @merchant.social_page_label(provider)
          account = @merchant.social_accounts.find_or_initialize_by(provider: provider)
          account.assign_attributes(
            account_name: account_name.presence || label.presence || "Démo #{provider.capitalize}",
            access_token: "demo",
            refresh_token: nil,
            external_id: "demo-#{provider}",
            status: :connected,
            connected_at: Time.current
          )
          account.save!
          account
        end

        def provider_status
          Social::Config::V1_PROVIDERS.filter_map do |provider|
            next unless @merchant.social_page_configured?(provider)

            account = @merchant.social_accounts.find_by(provider: provider)
            {
              provider: provider,
              page_configured: true,
              page_label: @merchant.social_page_label(provider),
              oauth_configured: Social::Config.configured?(provider),
              connected: account&.connected? || false,
              demo: account&.demo? || false,
              account_name: account&.account_name,
              status: account&.status
            }
          end
        end
      end
    end
  end
end
