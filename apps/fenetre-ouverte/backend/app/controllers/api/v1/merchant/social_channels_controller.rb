module Api
  module V1
    module Merchant
      class SocialChannelsController < ApplicationController
        before_action :authenticate_user!

        def index
          return forbidden unless current_user.merchant

          merchant = current_user.merchant
          accounts = merchant.social_accounts.index_by(&:provider)
          render json: Social::ChannelCatalog.all.map { |channel|
            account = accounts[channel.fetch(:id)]
            channel.merge(
              configured: Social::Config.deliverable_provider?(channel.fetch(:id)) &&
                          Social::Config.configured?(channel.fetch(:id)),
              connected_live: account&.connected? && !account.demo? &&
                              Social::Config.configured?(channel.fetch(:id)) || false,
              demo: account&.demo? || false
            )
          }
        end
      end
    end
  end
end
