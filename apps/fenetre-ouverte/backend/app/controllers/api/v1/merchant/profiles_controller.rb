module Api
  module V1
    module Merchant
      class ProfilesController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def show
          authorize @merchant, :view_profile?
          render json: MerchantProfileSerializer.new(@merchant).serializable_hash.merge(
            pending_profile_review: @merchant.merchant_profile_revisions.pending_review.exists?
          )
        end

        def update
          authorize @merchant, :update_profile?
          attributes = profile_params
          changeset = attributes.except(:logo, :photos).to_h
          revision = @merchant.merchant_profile_revisions.build(
            changeset: changeset, submitted_by: current_user
          )
          revision.logo.attach(attributes[:logo]) if attributes[:logo].present?
          revision.photos.attach(attributes[:photos]) if attributes[:photos].present?
          if revision.save
            render json: MerchantProfileSerializer.new(@merchant).serializable_hash.merge(
              pending_profile_review: true, review_id: revision.id
            ), status: :accepted
          else
            render json: { errors: revision.errors.full_messages }, status: :unprocessable_entity
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
            :facebook_page_url, :instagram_handle, :tiktok_handle,
            :logo, photos: []
          )
        end
      end
    end
  end
end
