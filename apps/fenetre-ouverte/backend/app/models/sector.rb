# app/models/sector.rb
class Sector < ApplicationRecord
  belongs_to :agency
  belongs_to :territory, optional: true
  has_many :merchants, dependent: :restrict_with_error

  validates :name, :slug, :city, :agency, presence: true
  validates :slug, uniqueness: { scope: :agency_id }
  validate :territory_matches_legacy_agency

  private

  def territory_matches_legacy_agency
    return unless territory&.legacy_agency_id.present?
    errors.add(:territory, "ne correspond pas a l'agence historique") if territory.legacy_agency_id != agency_id
  end

  default_scope { order(:position, :name) }
end
