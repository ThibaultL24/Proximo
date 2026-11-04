# app/models/product.rb
class Product < ApplicationRecord
  belongs_to :agency
  belongs_to :merchant, optional: true
  has_many :shop_orders, dependent: :restrict_with_error

  enum :checkout_mode, {
    one_time: 0,
    promo: 1,
    installment: 2,
    custom: 3
  }

  enum :status, { draft: 0, published: 1 }

  validates :name, :slug, :agency, :price_cents, presence: true
  validates :slug, uniqueness: { scope: :agency_id }
  validates :price_cents, numericality: { greater_than: 0 }

  scope :published, -> { where(status: :published) }

  def agency_product?
    merchant_id.blank?
  end

  def merchant_product?
    merchant_id.present?
  end

  def platform_fee_cents
    return 0 if agency_product?

    (price_cents * platform_fee_bps / 10_000.0).round
  end

  def merchant_amount_cents
    price_cents - platform_fee_cents
  end

  def catalog_price?
    stripe_price_id.present?
  end

  def custom_amount?
    custom?
  end
end
