class Territory < ApplicationRecord
  belongs_to :legacy_agency, class_name: "Agency", optional: true
  has_many :territory_memberships, dependent: :destroy
  has_many :users, through: :territory_memberships
  has_many :sectors, dependent: :restrict_with_error
  has_many :merchants, dependent: :restrict_with_error
  has_many :articles, dependent: :restrict_with_error
  has_many :publications, dependent: :restrict_with_error

  enum :status, { draft: 0, active: 1, suspended: 2 }
  validates :name, :slug, presence: true
  validates :slug, uniqueness: true

  scope :visible, -> { where(status: :active) }
end
