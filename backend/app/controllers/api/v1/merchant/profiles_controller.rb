# app/controllers/api/v1/merchant/profiles_controller.rb
module Api
  module V1
    module Merchant
      class ProfilesController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def show
          authorize @merchant, :update_profile?
          render json: MerchantProfileSerializer.new(@merchant).serializable_hash
        end

        def update
          authorize @merchant, :update_profile?

          if @merchant.update(profile_params)
            render json: MerchantProfileSerializer.new(@merchant.reload).serializable_hash
          else
            render json: { errors: @merchant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_merchant
          return forbidden unless current_user.merchant

          @merchant = current_user.merchant
        end

        def profile_params
          params.require(:merchant).permit(
            :short_description, :description,
            :address, :postal_code, :city, :phone, :email, :website,
            :logo, photos: []
          )
        end
      end
    end
  end
end
