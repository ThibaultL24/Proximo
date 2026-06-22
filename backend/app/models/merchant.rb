# app/models/merchant.rb
class Merchant < ApplicationRecord
  belongs_to :sector
  belongs_to :place, optional: true
  has_one :user, dependent: :nullify
  has_many :leads, dependent: :restrict_with_error
  has_many :qr_scans, dependent: :destroy
  has_many :articles, dependent: :nullify

  has_one_attached :logo
  has_many_attached :photos

  enum :status, { draft: 0, published: 1, archived: 2 }

  validates :name, :slug, :sector, presence: true
  validates :slug, :qr_token, uniqueness: true

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }
  before_validation :generate_qr_token, on: :create

  scope :published, -> { where(status: :published) }
  scope :featured, -> { where(featured: true) }

  def qr_url
    QrCodeService.merchant_qr_url(self)
  end

  private

  def generate_slug
    self.slug = name.parameterize
  end

  def generate_qr_token
    self.qr_token ||= loop do
      token = SecureRandom.alphanumeric(8).downcase
      break token unless self.class.exists?(qr_token: token)
    end
  end
end
