# app/controllers/api/v1/public/product_checkouts_controller.rb
module Api
  module V1
    module Public
      class ProductCheckoutsController < ApplicationController
        def create
          product = scope_public_agency(::Product.published.includes(:merchant)).find_by!(slug: params[:product_slug])
          url = BoutiqueCheckoutService.create_checkout!(product:, user: current_user)
          render json: { url: url }
        rescue BoutiqueCheckoutService::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def scope_public_agency(relation)
          agency = default_agency
          return relation.none unless agency

          relation.where(agency_id: agency.id)
        end
      end
    end
  end
end
