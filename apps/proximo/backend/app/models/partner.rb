class Partner < ApplicationRecord
  belongs_to :organization

  enum :status, { draft: 0, active: 1, archived: 2 }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: { scope: :organization_id }
end
