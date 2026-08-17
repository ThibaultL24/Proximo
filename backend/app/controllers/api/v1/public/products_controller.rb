# app/controllers/api/v1/public/products_controller.rb
module Api
  module V1
    module Public
      class ProductsController < ApplicationController
        def index
          products = scope_public_agency(::Product.published.includes(:merchant)).order(:name)
          render json: ProductSerializer.new(products).serializable_hash
        end

        def show
          product = scope_public_agency(::Product.published.includes(:merchant)).find_by!(slug: params[:slug])
          render json: ProductSerializer.new(product).serializable_hash
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
