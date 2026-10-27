# app/controllers/api/v1/merchant/photos_controller.rb
module Api
  module V1
    module Merchant
      class PhotosController < ApplicationController
        before_action :authenticate_user!
        before_action :set_merchant

        def destroy
          authorize @merchant, :update_profile?

          blob = ActiveStorage::Blob.find_signed!(params[:signed_id])
          attachment = @merchant.photos.attachments.find_by!(blob_id: blob.id)
          attachment.purge
          head :no_content
        rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
          render json: { error: "Photo introuvable" }, status: :not_found
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
