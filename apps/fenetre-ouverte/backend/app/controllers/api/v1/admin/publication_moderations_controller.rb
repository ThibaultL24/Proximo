module Api
  module V1
    module Admin
      class PublicationModerationsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_publication, only: %i[approve reject]

        def index
          items = scoped_publications.pending_review.includes(:merchant, :social_posts).order(created_at: :asc)
          render json: PublicationSerializer.new(items).serializable_hash
        end

        def approve
          unless @publication.merchant.published?
            return render json: { error: "La fiche du commercant doit etre publiee" },
                          status: :unprocessable_entity
          end
          @publication.transaction do
            @publication.publish!
            @publication.update!(reviewed_by: current_user, reviewed_at: Time.current)
          end

          # The merchant explicitly requested these channels; approval is the release gate.
          if @publication.requested_syndication? && @publication.merchant.subscription_active?
            selected = @publication.requested_providers & Social::Config::V1_PROVIDERS
            SocialPublishOrchestrator.call(publication: @publication, providers: selected) if selected.any?
          end
          render json: PublicationSerializer.new(@publication.reload).serializable_hash
        rescue StandardError => e
          Rails.logger.error("Social dispatch after approval: #{e.class} #{e.message}")
          # Editorial approval persists even if third-party networks fail.
          render json: PublicationSerializer.new(@publication.reload).serializable_hash
        end

        def reject
          @publication.update!(status: :rejected, review_note: params[:reason].presence || "Refuse par la moderation",
                               reviewed_by: current_user, reviewed_at: Time.current)
          render json: PublicationSerializer.new(@publication).serializable_hash
        end

        private

        def scoped_publications
          Publication.where(agency_id: current_user.agency_id)
        end

        def set_publication
          @publication = scoped_publications.pending_review.find(params[:id])
        end
      end
    end
  end
end
