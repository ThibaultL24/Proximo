module Api
  module V1
    module Territories
      class MerchantsController < BaseController
        def index
          merchants = territory.merchants.published.includes(:sector, :place)
          merchants = merchants.where(partner_category: params[:partner_category]) if params[:partner_category].present?
          render json: MerchantSerializer.new(merchants.order(:name)).serializable_hash
        end

        def show
          merchant = territory.merchants.published.find_by!(slug: params[:id])
          render json: MerchantDetailSerializer.new(merchant).serializable_hash
        end
      end
    end
  end
end
