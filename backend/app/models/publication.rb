# app/models/publication.rb
class Publication < ApplicationRecord
  belongs_to :merchant
  belongs_to :agency
  has_many :social_posts, dependent: :destroy

  has_one_attached :image

  enum :category, {
    vie_locale: 0,
    commerces: 1,
    loisirs: 2,
    immo: 3,
    bien_etre: 4
  }

  enum :status, { draft: 0, published: 1 }

  validates :body, presence: true
  validates :category, presence: true

  scope :published, -> { where(status: :published).where("published_at IS NULL OR published_at <= ?", Time.current) }
  scope :recent, -> { order(published_at: :desc, created_at: :desc) }

  def publish!
    update!(status: :published, published_at: Time.current)
  end
end
