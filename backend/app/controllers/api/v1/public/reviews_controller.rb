# app/controllers/api/v1/public/reviews_controller.rb
module Api
  module V1
    module Public
      class ReviewsController < ApplicationController
        def index
          reviewable = find_reviewable!
          reviews = reviewable.reviews.visible.includes(:user, :reply).recent
          render json: ReviewSerializer.new(reviews).serializable_hash
        end

        private

        def find_reviewable!
          case params[:reviewable_type]
          when "Merchant"
            scope_public_agency(::Merchant.published).find_by!(slug: params[:reviewable_slug])
          when "Article"
            scope_public_agency(::Article.published).find_by!(slug: params[:reviewable_slug])
          when "Publication"
            scope_public_agency(::Publication.published).find(params[:reviewable_id])
          else
            raise ActiveRecord::RecordNotFound
          end
        end

        def scope_public_agency(relation)
          agency = default_agency
          return relation.none unless agency

          relation.where(agency_id: agency.id)
        end
      end
    end
  end
end
