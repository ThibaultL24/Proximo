require "csv"

module Api
  module V1
    module Proximo
      class PropertyListingsController < ApplicationController
        before_action :authenticate_user!
        before_action :load_manager!
        before_action :set_listing, only: %i[show update prepare archive export]

        def index
          render json: scoped.order(updated_at: :desc).map { |listing| serialize(listing) }
        end

        def channels
          render json: PropertyPortalCatalog.all
        end

        def show
          render json: serialize(@listing)
        end

        def create
          attrs = listing_params
          listing = scoped.new(attrs.merge(created_by: current_user, status: :draft))
          if listing.save
            render json: serialize(listing), status: :created
          else
            render json: { errors: listing.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          return conflict("Un dossier préparé est figé : créez un nouveau brouillon pour le modifier.") unless @listing.draft?

          if @listing.update(listing_params)
            render json: serialize(@listing)
          else
            render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def prepare
          return conflict("Ce dossier ne peut plus être préparé.") unless @listing.draft?

          @listing.prepare!
          render json: serialize(@listing)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        def archive
          @listing.update!(status: :archived)
          render json: serialize(@listing)
        end

        def export
          return conflict("Complétez et préparez le dossier avant son export.") unless @listing.ready?

          payload = @listing.public_export
          if params[:kind].to_s == "csv"
            csv = CSV.generate(headers: true) do |file|
              file << payload.keys
              file << payload.values.map { |v| safe_csv_value(v) }
            end
            send_data csv, filename: "proximo-annonce-#{@listing.id}.csv",
                      type: "text/csv; charset=utf-8", disposition: "attachment"
          elsif params[:kind].to_s == "json"
            render json: {
              format: "proximo-generic-v1", portal_compatible: false,
              destination_status: "not_submitted", listing: payload
            }
          else
            render json: { error: "Format générique autorisé : csv ou json" }, status: :unprocessable_entity
          end
        end

        private

        def load_manager!
          return if performed?

          membership = current_user.memberships.find_by(organization_id: params[:organization_id])
          return not_found unless membership
          forbidden unless membership.owner? || membership.manager?
        end

        def scoped
          Organization.find(params[:organization_id]).property_listings
        end

        def set_listing
          @listing = scoped.find(params[:id])
        end

        def listing_params
          params.require(:property_listing).permit(
            :title, :description, :city, :postal_code, :property_kind,
            :transaction_type, :price_cents, :area_sqm, :rooms, :bedrooms,
            :mandate_reference, :energy_class, :ghg_class
          )
        end

        def serialize(listing)
          listing.as_json(only: %i[
            id organization_id created_by_id title description city postal_code
            property_kind transaction_type status price_cents area_sqm
            rooms bedrooms mandate_reference energy_class ghg_class
            prepared_at created_at updated_at
          ]).merge(
            external_publication: false,
            legal_review_required: true,
            portal_feed_available: false
          )
        end

        def safe_csv_value(value)
          # Un champ texte ne doit pas pouvoir injecter une formule au moment
          # où un collaborateur ouvre le CSV dans Excel/Calc.
          string = value.to_s
          string.match?(/\A[\s]*[=+@\-]/) ? "'#{string}" : string
        end

        def conflict(message)
          render json: { error: message }, status: :conflict
        end
      end
    end
  end
end
