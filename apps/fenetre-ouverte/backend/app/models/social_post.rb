# app/models/social_post.rb
class SocialPost < ApplicationRecord
  belongs_to :publication

  enum :provider, {
    facebook: 0,
    instagram: 1,
    twitter: 2,
    linkedin: 3,
    tiktok: 4,
    wordpress: 5
  }

  enum :status, { pending: 0, published: 1, failed: 2, skipped: 3, processing: 4, uncertain: 5 }

  validates :provider, uniqueness: { scope: :publication_id }

  def wordpress_delivery_slug
    record = publication
    "fenetre-ouverte-#{record.agency_id}-#{record.merchant_id}-#{record.id}"
  end
end
