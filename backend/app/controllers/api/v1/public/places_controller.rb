# app/controllers/api/v1/public/places_controller.rb
module Api
  module V1
    module Public
      class PlacesController < ApplicationController
        def index
          places = if params[:parent_id].present?
                     parent = ::Place.find(params[:parent_id])
                     parent.children.ordered
                   else
                     ::Place.country_root.children.ordered
                   end

          render json: PlaceSerializer.new(places).serializable_hash
        end

        def lookup
          slugs = params[:path].to_s.split("/").compact_blank
          place = ::Place.find_by_path!(slugs)

          render json: {
            place: PlaceSerializer.new(place).serializable_hash,
            breadcrumb: PlaceSerializer.new(place.breadcrumb).serializable_hash,
            children: PlaceSerializer.new(place.children.ordered).serializable_hash
          }
        end
      end
    end
  end
end
