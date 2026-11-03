module Api
  module V1
    module Admin
      class GazetteEditionsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_edition, only: %i[show update publish archive]

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
          params.require(:gazette_edition).permit(
            :issue_label, :edition_label, :lock_version,
            settings: %i[subtitle territory banner contact legal],
            pages: %i[id articleId template rubric note]
          )
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
            id issue_label edition_label status settings pages
            lock_version published_at created_at updated_at
          ])
        end
      end
    end
  end
end
