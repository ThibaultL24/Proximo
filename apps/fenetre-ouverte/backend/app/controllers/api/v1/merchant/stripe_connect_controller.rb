# app/controllers/api/v1/merchant/stripe_connect_controller.rb
module Api
  module V1
    module Merchant
      class StripeConnectController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def show
          authorize @merchant, :manage_stripe?
          render json: StripeConnectService.for(@merchant).status
        end

        def create
          authorize @merchant, :manage_stripe?

          url = StripeConnectService.for(@merchant).create_onboarding_link!
          render json: { url: url }
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def dashboard
          authorize @merchant, :manage_stripe?

          url = StripeConnectService.for(@merchant).create_dashboard_link!
          if url
            render json: { url: url }
          else
            render json: { error: "Tableau de bord Stripe indisponible" }, status: :unprocessable_entity
          end
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
