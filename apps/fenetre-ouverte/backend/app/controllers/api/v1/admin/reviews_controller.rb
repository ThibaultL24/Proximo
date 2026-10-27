# app/controllers/api/v1/admin/reviews_controller.rb
module Api
  module V1
    module Admin
      class ReviewsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_review

        def update
          authorize_review!
          @review.update!(hidden: ActiveModel::Type::Boolean.new.cast(params[:hidden]))
          render json: ReviewSerializer.new(@review.reload).serializable_hash
        end

        private

        def set_review
          @review = Review.joins("LEFT JOIN merchants ON reviews.reviewable_type = 'Merchant' AND reviews.reviewable_id = merchants.id")
                          .joins("LEFT JOIN articles ON reviews.reviewable_type = 'Article' AND reviews.reviewable_id = articles.id")
                          .joins("LEFT JOIN publications ON reviews.reviewable_type = 'Publication' AND reviews.reviewable_id = publications.id")
                          .where(
                            "merchants.agency_id = :agency_id OR articles.agency_id = :agency_id OR publications.agency_id = :agency_id",
                            agency_id: current_user.agency_id
                          )
                          .find(params[:id])
        end

        def authorize_review!
          forbidden unless current_user.agency_id
        end
      end
    end
  end
end
