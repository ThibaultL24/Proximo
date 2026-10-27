class Partner < ApplicationRecord
  belongs_to :organization
  belongs_to :legacy_merchant, class_name: "Merchant", optional: true
  has_many :leads, dependent: :restrict_with_error

  enum :status, { draft: 0, active: 1, archived: 2 }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: { scope: :organization_id }
end
