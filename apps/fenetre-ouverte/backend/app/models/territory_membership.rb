class TerritoryMembership < ApplicationRecord
  belongs_to :territory
  belongs_to :user

  enum :role, { contributor: 0, editor: 1, owner: 2 }

  validates :user_id, uniqueness: { scope: :territory_id }
end
