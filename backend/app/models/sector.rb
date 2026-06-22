# app/models/sector.rb
class Sector < ApplicationRecord
  has_many :merchants, dependent: :restrict_with_error

  validates :name, :slug, :city, presence: true
  validates :slug, uniqueness: true

  default_scope { order(:position, :name) }
end
