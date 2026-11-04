module Api
  module V1
    module Admin
      class ProfileReviewsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_revision, only: %i[approve reject]

        def index
          revisions = scoped_revisions.pending_review.includes(:merchant, :submitted_by).order(created_at: :asc)
          render json: revisions.map { |r| serialize(r) }
        end

        def approve
          @revision.approve!(reviewer: current_user)
          render json: serialize(@revision.reload)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
        end

        def reject
          @revision.update!(status: :rejected, review_note: params[:reason].presence || "Modifications refusees",
                            reviewed_by: current_user, reviewed_at: Time.current)
          render json: serialize(@revision)
        end

        private

        def scoped_revisions
          MerchantProfileRevision.joins(:merchant).where(merchants: { agency_id: current_user.agency_id })
        end

        def set_revision
          @revision = scoped_revisions.pending_review.find(params[:id])
        end

        def serialize(revision)
          {
            id: revision.id, merchant_id: revision.merchant_id, merchant_name: revision.merchant.name,
            status: revision.status, changeset: revision.changeset,
            logo_attached: revision.logo.attached?, photos_count: revision.photos.count,
            logo_url: AttachmentUrls.blob_path(revision.logo),
            photo_urls: AttachmentUrls.blob_paths(revision.photos),
            submitted_at: revision.created_at, review_note: revision.review_note
          }
        end
      end
    end
  end
end
