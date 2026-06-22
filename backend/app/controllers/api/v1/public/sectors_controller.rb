# app/controllers/api/v1/public/sectors_controller.rb
module Api
  module V1
    module Public
      class SectorsController < ApplicationController
        def index
          sectors = ::Sector.all
          render json: SectorSerializer.new(sectors).serializable_hash
        end

        def show
          sector = ::Sector.find_by!(slug: params[:slug])
          render json: SectorSerializer.new(sector).serializable_hash
        end
      end
    end
  end
end
