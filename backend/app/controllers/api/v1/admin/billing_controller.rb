# app/controllers/api/v1/admin/billing_controller.rb
module Api
  module V1
    module Admin
      class BillingController < ApplicationController
        before_action :authenticate_admin!

        def show
          return forbidden unless current_agency

          render json: AgencySubscriptionService.for(current_agency).status
        end

        def create
          return forbidden unless current_agency

          url = AgencySubscriptionCheckoutService.create_checkout!(agency: current_agency, user: current_user)
          render json: { url: url }
        rescue AgencySubscriptionCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def portal
          return forbidden unless current_agency

          url = AgencySubscriptionCheckoutService.new(current_agency, current_user).portal_url
          render json: { url: url }
        rescue AgencySubscriptionCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
