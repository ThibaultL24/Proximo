module Api
  module V1
    module Merchant
      class WordpressConnectionsController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def show
          account = @merchant.social_accounts.find_by(provider: :wordpress)
          render json: payload(account)
        end

        def create
          attrs = params.require(:wordpress).permit(:site_url, :username, :application_password, :authorized)
          unless ActiveModel::Type::Boolean.new.cast(attrs[:authorized])
            return render json: { error: "Confirmez que vous gérez ce site et êtes autorisé à y publier." },
                          status: :unprocessable_entity
          end

          client = Social::WordpressClient.new(
            site_url: attrs[:site_url],
            username: attrs[:username],
            application_password: attrs[:application_password]
          )
          client.verify!

          account = @merchant.social_accounts.find_or_initialize_by(provider: :wordpress)
          account.assign_attributes(
            account_name: attrs[:username].to_s.strip,
            external_id: client.site_url,
            access_token: attrs[:application_password],
            refresh_token: nil,
            status: :connected,
            connected_at: Time.current
          )
          account.save!
          render json: payload(account), status: :created
        rescue Social::WordpressClient::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def destroy
          @merchant.social_accounts.find_by(provider: :wordpress)&.destroy!
          head :no_content
        end

        private

        def set_merchant
          return if performed?
          return forbidden unless current_user&.merchant

          @merchant = current_user.merchant
        end

        def payload(account)
          {
            connected: account&.connected? && !account.demo? || false,
            site_url: account&.external_id,
            username: account&.account_name
          }
        end
      end
    end
  end
end
