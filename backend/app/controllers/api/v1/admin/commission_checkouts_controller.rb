# app/controllers/api/v1/admin/commission_checkouts_controller.rb
module Api
  module V1
    module Admin
      class CommissionCheckoutsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_commission

        def create
          authorize @commission, :pay?

          url = CommissionStripeCheckoutService.create_checkout!(commission: @commission)
          render json: { url: url }
        rescue CommissionStripeCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue Stripe::StripeError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def set_commission
          @commission = ::Commission.find(params[:commission_id])
        end
      end
    end
  end
end
