# app/controllers/api/v1/public/merchants_controller.rb
module Api
  module V1
    module Public
      class MerchantsController < ApplicationController
        def index
          merchants = ::Merchant.published.includes(:place, :sector)
          merchants = filter_by_place(merchants)
          merchants = merchants.where(sector_id: sector.id) if params[:sector_slug].present? && (sector = ::Sector.find_by(slug: params[:sector_slug]))
          merchants = merchants.featured if params[:featured] == "true"
          render json: MerchantSerializer.new(merchants).serializable_hash
        end

        def show
          merchant = ::Merchant.published.includes(:articles).find_by!(slug: params[:slug])
          render json: MerchantDetailSerializer.new(merchant).serializable_hash
        end

        private

        def filter_by_place(merchants)
          return merchants unless params[:place_path].present?

          place = ::Place.find_by_path!(params[:place_path].split("/"))
          merchants.where(place_id: place.descendant_ids)
        end
      end
    end
  end
end
