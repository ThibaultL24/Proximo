# app/services/merchant_subscription_checkout_service.rb
class MerchantSubscriptionCheckoutService
  class Error < StandardError; end

  TRIAL_DAYS = 7

  def self.create_checkout!(merchant:, user:)
    new(merchant, user).create_checkout!
  end

  def initialize(merchant, user)
    @merchant = merchant
    @user = user
  end

  def create_checkout!
    ensure_price_configured!
    return portal_url if MerchantSubscriptionService.for(merchant).active?

    customer_id = ensure_customer_id!
    session = Stripe::Checkout::Session.create(
      mode: "subscription",
      customer: customer_id,
      line_items: [{ price: merchant_price_id, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          merchant_id: merchant.id,
          user_id: user.id,
          plan: "merchant"
        }
      },
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        merchant_id: merchant.id,
        user_id: user.id,
        plan: "merchant"
      }
    )

    session.url
  end

  def portal_url
    ensure_customer_id!
    session = Stripe::BillingPortal::Session.create(
      customer: merchant.stripe_customer_id,
      return_url: return_url
    )
    session.url
  end

  private

  attr_reader :merchant, :user

  def ensure_price_configured!
    return if merchant_price_id.present?

    raise Error, "STRIPE_PRICE_MERCHANT_MONTHLY manquant — lancez rails stripe:setup_products"
  end

  def merchant_price_id
    ENV["STRIPE_PRICE_MERCHANT_MONTHLY"]
  end

  def ensure_customer_id!
    return merchant.stripe_customer_id if merchant.stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: user.email,
      name: user.full_name.presence,
      metadata: {
        merchant_id: merchant.id,
        user_id: user.id
      }
    )

    merchant.update!(stripe_customer_id: customer.id)
    customer.id
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def success_url
    "#{frontend_url}/espace-commercant?billing=success"
  end

  def cancel_url
    "#{frontend_url}/espace-commercant?billing=cancelled"
  end

  def return_url
    "#{frontend_url}/espace-commercant/ma-fiche?billing=updated"
  end
end
