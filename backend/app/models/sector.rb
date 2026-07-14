# app/models/sector.rb
class Sector < ApplicationRecord
  belongs_to :agency
  has_many :merchants, dependent: :restrict_with_error

  validates :name, :slug, :city, :agency, presence: true
  validates :slug, uniqueness: { scope: :agency_id }

  default_scope { order(:position, :name) }
end
