# app/models/social_post.rb
class SocialPost < ApplicationRecord
  belongs_to :publication

  enum :provider, {
    facebook: 0,
    instagram: 1,
    twitter: 2,
    linkedin: 3,
    tiktok: 4
  }

  enum :status, { pending: 0, published: 1, failed: 2, skipped: 3 }

  validates :provider, uniqueness: { scope: :publication_id }
end
