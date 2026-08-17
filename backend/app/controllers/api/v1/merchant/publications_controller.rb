# app/controllers/api/v1/merchant/publications_controller.rb
module Api
  module V1
    module Merchant
      class PublicationsController < ApplicationController
        include MerchantSubscriptionRequired

        before_action :authenticate_user!
        before_action :set_merchant
        before_action :require_merchant_subscription!, only: :create

        def index
          publications = @merchant.publications.includes(:social_posts, image_attachment: :blob).recent
          render json: PublicationSerializer.new(publications).serializable_hash
        end

        def create
          publication = PublicationCreator.call(
            merchant: @merchant,
            params: publication_params,
            syndicate: ActiveModel::Type::Boolean.new.cast(params[:syndicate]),
            providers: Array(params[:providers]).compact_blank
          )

          render json: PublicationSerializer.new(publication).serializable_hash, status: :created
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        private

        def set_merchant
          return forbidden unless current_user.merchant

          @merchant = current_user.merchant
        end

        def publication_params
          params.require(:publication).permit(:body, :category, :image)
        end
      end
    end
  end
end
