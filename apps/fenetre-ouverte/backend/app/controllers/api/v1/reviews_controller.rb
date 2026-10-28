# app/controllers/api/v1/reviews_controller.rb
module Api
  module V1
    class ReviewsController < ApplicationController
      before_action :authenticate_user!

      def create
        reviewable = find_reviewable!
        review = ReviewCreator.call(
          user: current_user,
          reviewable:,
          body: review_params[:body],
          rating: review_params[:rating]
        )
        render json: ReviewSerializer.new(review.reload).serializable_hash, status: :created
      rescue Pundit::NotAuthorizedError
        forbidden
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end

      def reply
        review = Review.visible.find(params[:id])
        reply = ReviewReplyCreator.call(user: current_user, review:, body: reply_params[:body])
        render json: ReviewSerializer.new(review.reload).serializable_hash, status: :created
      rescue Pundit::NotAuthorizedError
        forbidden
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end

      private

      def find_reviewable!
        case review_params[:reviewable_type]
        when "Merchant"
          default_agency.merchants.published.find_by!(slug: review_params[:reviewable_slug])
        when "Article"
          default_agency.articles.published.find_by!(slug: review_params[:reviewable_slug])
        when "Publication"
          default_agency.publications.published.find(review_params[:reviewable_id])
        else
          raise ActiveRecord::RecordNotFound
        end
      end

      def review_params
        params.require(:review).permit(:reviewable_type, :reviewable_slug, :reviewable_id, :body, :rating)
      end

      def reply_params
        params.require(:reply).permit(:body)
      end
    end
  end
end
