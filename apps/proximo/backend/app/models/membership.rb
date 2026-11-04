class Membership < ApplicationRecord
  belongs_to :organization
  belongs_to :user

  enum :role, { member: 0, manager: 1, owner: 2 }

  validates :user_id, uniqueness: { scope: :organization_id }
end
