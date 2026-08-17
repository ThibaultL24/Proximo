# app/controllers/api/v1/public/publications_controller.rb
module Api
  module V1
    module Public
      class PublicationsController < ApplicationController
        include AttachmentUrls

        def show
          publication = scope_public_agency(::Publication.published.includes(:merchant, image_attachment: :blob))
                        .find(params[:id])
          render json: serialize_publication(publication)
        end

        private

        def scope_public_agency(relation)
          agency = default_agency
          return relation.none unless agency

          relation.where(agency_id: agency.id)
        end

        def serialize_publication(publication)
          {
            id: publication.id,
            body: publication.body,
            category: publication.category,
            published_at: publication.published_at || publication.created_at,
            image_url: blob_path(publication.image),
            merchant: {
              id: publication.merchant.id,
              name: publication.merchant.name,
              slug: publication.merchant.slug,
              logo_url: blob_path(publication.merchant.logo)
            }
          }
        end
      end
    end
  end
end
