module Api
  module V1
    module Admin
      class GazetteEditionsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_edition, only: %i[show update publish archive upload_asset]

        def index
          render json: scoped_editions.order(updated_at: :desc).map { |edition| serialize(edition) }
        end

        def show
          render json: serialize(@edition)
        end

        def create
          edition = scoped_editions.new(edition_params.except(:lock_version))
          edition.status = :draft

          if edition.save
            render json: serialize(edition), status: :created
          else
            render json: { errors: edition.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          return immutable_error unless @edition.draft?
          return conflict unless expected_revision?(@edition)

          if @edition.update(edition_params.except(:lock_version))
            render json: serialize(@edition)
          else
            render json: { errors: @edition.errors.full_messages }, status: :unprocessable_entity
          end
        rescue ActiveRecord::StaleObjectError
          conflict
        end

        def upload_asset
          return immutable_error unless @edition.draft?
          return conflict unless expected_revision?(@edition)

          upload = params[:file]
          slot = params[:slot].to_s
          page_id = params[:page_id].to_s
          key = if %w[headerLogo footerLogo].include?(slot)
                  slot
                elsif %w[extraImage qrImage spotlightLogo promoImage].include?(slot) &&
                      page_id.match?(/\A[1-9]\d*\z/) &&
                      @edition.pages.any? { |page| page["id"].to_s == page_id }
                  "#{slot}:#{page_id}"
                end

          unless key && upload.is_a?(ActionDispatch::Http::UploadedFile) &&
                 upload.size.between?(1, 5_000_000) &&
                 %w[image/png image/jpeg image/webp].include?(upload.content_type)
            return render json: { error: "Image ou emplacement invalide" },
                          status: :unprocessable_entity
          end

          @edition.with_lock do
            blob = ActiveStorage::Blob.create_and_upload!(
              io: upload.tempfile, filename: upload.original_filename,
              content_type: upload.content_type
            )
            @edition.media_assets.attach(blob)
            @edition.update!(assets_manifest: @edition.assets_manifest.merge(key => blob.id))
          end

          render json: serialize(@edition.reload)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        rescue ActiveRecord::StaleObjectError
          conflict
        end

        def publish
          return conflict unless expected_revision?(@edition)

          @edition.publish!
          render json: serialize(@edition.reload)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        rescue ActiveRecord::StaleObjectError
          conflict
        end

        def archive
          return conflict unless expected_revision?(@edition)

          @edition.archive!
          render json: serialize(@edition.reload)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        rescue ActiveRecord::StaleObjectError
          conflict
        end

        private

        def set_edition
          @edition = scoped_editions.find(params[:id])
        end

        def scoped_editions
          GazetteEdition.where(agency_id: current_user.agency_id)
        end

        def edition_params
          permitted = params.require(:gazette_edition).permit(
            :issue_label, :edition_label, :lock_version,
            settings: %i[subtitle territory banner contact legal],
            pages: %i[id articleId template rubric note leftHeading rightHeading imageCaption columnBreakAt contentStart contentEnd continuation]
          )

          # Form-encoded payloads arrive as strings. Normalize known scalar
          # fields before persisting them in jsonb; leave invalid input intact
          # so the model can reject it, rather than silently accepting it.
          Array(permitted[:pages]).each do |page|
            %i[contentStart contentEnd columnBreakAt].each do |field|
              value = page[field]
              page[field] = value.to_i if value.present? && value.to_s.match?(/\A-?\d+\z/)
            end

            next unless page.key?(:continuation)

            case page[:continuation].to_s
            when "true", "1" then page[:continuation] = true
            when "false", "0" then page[:continuation] = false
            end
          end
          permitted
        end

        def expected_revision?(edition)
          revision = params[:lock_version] || params.dig(:gazette_edition, :lock_version)
          revision.present? && revision.to_s.match?(/\A\d+\z/) &&
            revision.to_i == edition.lock_version
        end

        def conflict
          render json: { error: "L'édition a changé. Rechargez-la avant de continuer." },
                 status: :conflict
        end

        def immutable_error
          render json: { error: "Une édition publiée ne peut plus être modifiée." },
                 status: :conflict
        end

        def serialize(edition)
          edition.as_json(only: %i[
            id issue_label edition_label status settings
            lock_version published_at created_at updated_at
          ]).merge(
            "pages" => edition.printable_pages,
            "asset_urls" => edition.asset_urls
          )
        end
      end
    end
  end
end
