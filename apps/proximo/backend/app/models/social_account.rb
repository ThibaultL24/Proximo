# app/models/social_account.rb
class SocialAccount < ApplicationRecord
  belongs_to :merchant

  enum :provider, {
    facebook: 0,
    instagram: 1,
    twitter: 2,
    linkedin: 3,
    tiktok: 4
  }

  enum :status, { connected: 0, expired: 1, error: 2 }

  validates :account_name, presence: true
  validates :provider, uniqueness: { scope: :merchant_id }

  scope :ready, -> { where(status: :connected) }

  def demo?
    access_token == "demo"
  end
end
