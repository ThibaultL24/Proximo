# app/controllers/api/v1/public/sectors_controller.rb
module Api
  module V1
    module Public
      class SectorsController < ApplicationController
        def index
          sectors = scope_public_agency(::Sector.all)
          render json: SectorSerializer.new(sectors).serializable_hash
        end

        def show
          sector = scope_public_agency(::Sector).find_by!(slug: params[:slug])
          render json: SectorSerializer.new(sector).serializable_hash
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
