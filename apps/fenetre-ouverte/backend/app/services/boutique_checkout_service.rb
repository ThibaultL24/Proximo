# app/services/boutique_checkout_service.rb
class BoutiqueCheckoutService
  class Error < StandardError; end

  PLATFORM_FEE_BPS = 1000

  def self.create_checkout!(product:, user: nil)
    new(product, user).create_checkout!
  end

  def initialize(product, user)
    @product = product
    @user = user
  end

  def create_checkout!
    validate!

    order = product.shop_orders.create!(
      user: user,
      customer_email: user&.email,
      amount_cents: product.price_cents,
      currency: product.currency,
      status: :pending
    )

    session = Stripe::Checkout::Session.create(session_params(order))
    order.update!(stripe_checkout_session_id: session.id)
    session.url
  end

  private

  attr_reader :product, :user

  def validate!
    raise Error, "Produit indisponible" unless product.published?
    raise Error, "Montant invalide" unless product.price_cents.positive?

    return unless product.merchant_product?

    merchant = product.merchant
    unless merchant.stripe_account_id.present? && merchant.stripe_onboarding_completed
      raise Error, "Le commercant doit terminer Stripe Connect avant la vente"
    end
  end

  def session_params(order)
    params = {
      line_items: [line_item],
      success_url: success_url(order),
      cancel_url: cancel_url(order),
      metadata: {
        shop_order_id: order.id,
        product_id: product.id,
        plan: "boutique"
      }
    }

    params[:customer_email] = user.email if user&.email.present?
    params[:mode] = "payment"
    params[:payment_intent_data] = payment_intent_data if product.merchant_product?
    params[:allow_promotion_codes] = true if product.promo? || product.custom?

    params
  end

  def line_item
    if product.stripe_price_id.present?
      return { price: product.stripe_price_id, quantity: 1 }
    end

    {
      price_data: {
        currency: product.currency.downcase,
        unit_amount: product.price_cents,
        product_data: {
          name: product.name,
          description: product.description.to_s.truncate(200)
        }
      },
      quantity: 1
    }
  end

  def payment_intent_data
    merchant = product.merchant
    fee = product.platform_fee_cents

    data = {
      transfer_data: { destination: merchant.stripe_account_id },
      metadata: {
        product_id: product.id,
        merchant_id: merchant.id
      }
    }
    data[:application_fee_amount] = fee if fee.positive?
    data
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def success_url(order)
    "#{frontend_url}/boutique?payment=success&order_id=#{order.id}"
  end

  def cancel_url(order)
    "#{frontend_url}/boutique?payment=cancelled&order_id=#{order.id}"
  end
end
