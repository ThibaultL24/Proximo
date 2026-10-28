# app/models/shop_order.rb
class ShopOrder < ApplicationRecord
  belongs_to :product
  belongs_to :user, optional: true

  enum :status, { pending: 0, paid: 1, cancelled: 2 }

  validates :amount_cents, numericality: { greater_than: 0 }
end
