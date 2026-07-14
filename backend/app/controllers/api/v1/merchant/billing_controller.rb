# app/controllers/api/v1/merchant/billing_controller.rb
module Api
  module V1
    module Merchant
      class BillingController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def show
          authorize @merchant, :manage_billing?
          render json: MerchantSubscriptionService.for(@merchant).status
        end

        def create
          authorize @merchant, :manage_billing?

          url = MerchantSubscriptionCheckoutService.create_checkout!(merchant: @merchant, user: current_user)
          render json: { url: url }
        rescue MerchantSubscriptionCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def portal
          authorize @merchant, :manage_billing?

          url = MerchantSubscriptionCheckoutService.new(@merchant, current_user).portal_url
          render json: { url: url }
        rescue MerchantSubscriptionCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def set_merchant
          return forbidden unless current_user.merchant

          @merchant = current_user.merchant
        end
      end
    end
  end
end
