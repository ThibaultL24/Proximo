class Organization < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :partners, dependent: :restrict_with_error

  enum :status, { draft: 0, active: 1, suspended: 2 }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true
end
