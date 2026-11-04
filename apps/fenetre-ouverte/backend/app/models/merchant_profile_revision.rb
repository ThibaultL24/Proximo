class MerchantProfileRevision < ApplicationRecord
  belongs_to :merchant
  belongs_to :submitted_by, class_name: "User"
  belongs_to :reviewed_by, class_name: "User", optional: true
  has_one_attached :logo
  has_many_attached :photos

  enum :status, { pending_review: 0, approved: 1, rejected: 2 }
  validates :changeset, presence: true, unless: -> { logo.attached? || photos.attached? }

  def approve!(reviewer:)
    transaction do
      lock!
      raise ActiveRecord::RecordInvalid, self unless pending_review?
      merchant.assign_attributes(changeset)
      merchant.save!
      merchant.logo.attach(logo.blob) if logo.attached?
      merchant.photos.attach(photos.map(&:blob)) if photos.attached?
      update!(status: :approved, reviewed_by: reviewer, reviewed_at: Time.current)
      merchant.merchant_profile_revisions.where(status: :pending_review)
              .where.not(id: id).update_all(status: self.class.statuses.fetch("rejected"),
                                            review_note: "Remplacee par une version plus recente",
                                            reviewed_by_id: reviewer.id, reviewed_at: Time.current)
    end
  end
end
