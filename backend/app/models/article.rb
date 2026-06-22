# app/models/article.rb
class Article < ApplicationRecord
  belongs_to :author, class_name: "User"
  belongs_to :merchant, optional: true
  belongs_to :place, optional: true

  has_one_attached :cover_image

  enum :category, {
    local_news: 0,
    merchant_spotlight: 1,
    real_estate: 2,
    agency_news: 3
  }

  enum :status, { draft: 0, published: 1, archived: 2 }

  validates :title, :slug, :author, presence: true
  validates :slug, uniqueness: true

  before_validation :generate_slug, if: -> { slug.blank? && title.present? }

  scope :published, lambda {
    where(status: :published).where("published_at IS NULL OR published_at <= ?", Time.current)
  }

  GAZETTE_CATEGORIES = %w[local_news merchant_spotlight].freeze
  IMMO_CATEGORIES = %w[real_estate agency_news].freeze

  validate :category_matches_editorial_scope, if: :category_changed?

  scope :gazette, -> { where(category: GAZETTE_CATEGORIES) }
  scope :immo, -> { where(category: IMMO_CATEGORIES) }

  private

  def category_matches_editorial_scope
    return if GAZETTE_CATEGORIES.include?(category) || IMMO_CATEGORIES.include?(category)

    errors.add(:category, "n'est pas valide")
  end

  def generate_slug
    self.slug = title.parameterize
  end
end
