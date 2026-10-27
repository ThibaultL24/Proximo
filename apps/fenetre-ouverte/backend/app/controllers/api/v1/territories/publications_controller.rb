module Api
  module V1
    module Territories
      class PublicationsController < BaseController
        def index
          publications = territory.publications.published.includes(:merchant, :social_posts)
          render json: PublicationSerializer.new(publications.recent).serializable_hash
        end

        def show
          publication = territory.publications.published.find(params[:id])
          render json: PublicationSerializer.new(publication).serializable_hash
        end
      end
    end
  end
end
