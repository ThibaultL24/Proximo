# app/controllers/api/v1/public/merchants_controller.rb
module Api
  module V1
    module Public
      class MerchantsController < ApplicationController
        def index
          merchants = scope_public_agency(::Merchant.published.includes(:place, :sector))
          merchants = filter_by_place(merchants)
          if params[:sector_slug].present? && (sector = scope_public_agency(::Sector).find_by(slug: params[:sector_slug]))
            merchants = merchants.where(sector_id: sector.id)
          end
          merchants = merchants.featured if params[:featured] == "true"
          merchants = merchants.where(partner_category: params[:partner_category]) if params[:partner_category].present?
          render json: MerchantSerializer.new(merchants).serializable_hash
        end

        def show
          merchant = scope_public_agency(::Merchant.published.includes(:articles)).find_by!(slug: params[:slug])
          render json: MerchantDetailSerializer.new(merchant).serializable_hash
        end

        private

        def scope_public_agency(relation)
          agency = default_agency
          return relation.none unless agency

          relation.where(agency_id: agency.id)
        end

        def filter_by_place(merchants)
          return merchants unless params[:place_path].present?

          place = ::Place.find_by_path!(params[:place_path].split("/"))
          merchants.where(place_id: place.descendant_ids)
        end
      end
    end
  end
end
