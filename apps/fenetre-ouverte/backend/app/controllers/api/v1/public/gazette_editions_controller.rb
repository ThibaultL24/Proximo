module Api
  module V1
    module Public
      class GazetteEditionsController < ApplicationController
        def index
          editions = public_editions.order(published_at: :desc, id: :desc)
          render json: editions.map { |edition| serialize(edition, summary: true) }
        end

        def show
          edition = public_editions.find(params[:id])
          render json: serialize(edition)
        end

        private

        def public_editions
          agency = default_agency
          return GazetteEdition.none unless agency

          GazetteEdition.where(agency_id: agency.id, status: %i[published archived])
        end

        def serialize(edition, summary: false)
          data = edition.as_json(only: %i[
            id issue_label edition_label status published_at
          ])
          return data if summary

          data.merge(
            "settings" => edition.settings,
            "pages" => edition.printable_pages,
            "asset_urls" => edition.asset_urls
          )
        end
      end
    end
  end
end
