# app/controllers/api/v1/client/billing_controller.rb
module Api
  module V1
    module Client
      class BillingController < ApplicationController
        before_action :authenticate_user!
        before_action :require_client!

        def show
          render json: ClientSubscriptionService.for(current_user).status
        end

        def create
          render json: {
            error: "Le compte citoyen est gratuit. Un projet immobilier se transmet en magasin, auprès d'un commerçant partenaire."
          }, status: :unprocessable_entity
        end

        def portal
          url = ClientSubscriptionCheckoutService.new(current_user).portal_url
          render json: { url: url }
        rescue ClientSubscriptionCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def invoices
          render json: { invoices: StripeInvoiceList.for_customer(current_user.stripe_customer_id) }
        end

        private

        def require_client!
          forbidden unless current_user&.client?
        end
      end
    end
  end
end
