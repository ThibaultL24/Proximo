# app/models/merchant.rb
class Merchant < ApplicationRecord
  belongs_to :sector
  belongs_to :agency

  has_many :products, dependent: :destroy

  has_many :reviews, as: :reviewable, dependent: :destroy
  belongs_to :place, optional: true
  has_one :user, dependent: :nullify
  has_many :leads, dependent: :restrict_with_error
  has_many :qr_scans, dependent: :destroy
  has_many :articles, dependent: :nullify

  has_one_attached :logo
  has_many_attached :photos

  enum :status, { draft: 0, published: 1, archived: 2 }
  enum :partner_category, {
    vie_locale: 0,
    commerces: 1,
    loisirs: 2,
    immo: 3,
    bien_etre: 4
  }

  has_many :publications, dependent: :destroy
  has_many :social_accounts, dependent: :destroy

  validates :name, :slug, :sector, :agency, presence: true
  validates :slug, uniqueness: { scope: :agency_id }
  validates :qr_token, uniqueness: true

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }
  before_validation :generate_qr_token, on: :create

  scope :published, -> { where(status: :published) }
  scope :featured, -> { where(featured: true) }

  def qr_url
    QrCodeService.merchant_qr_url(self)
  end

  def subscription_active?
    MerchantSubscriptionService.for(self).active?
  end

  def social_page_configured?(provider)
    case provider.to_s
    when "facebook" then facebook_page_url.present?
    when "instagram" then instagram_handle.present?
    when "tiktok" then tiktok_handle.present?
    else false
    end
  end

  def social_page_label(provider)
    case provider.to_s
    when "facebook" then facebook_page_url
    when "instagram" then instagram_handle
    when "tiktok" then tiktok_handle
    end
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
