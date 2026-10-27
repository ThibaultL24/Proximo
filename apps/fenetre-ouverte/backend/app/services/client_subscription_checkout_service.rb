# app/services/client_subscription_checkout_service.rb
class ClientSubscriptionCheckoutService
  class Error < StandardError; end

  TRIAL_DAYS = 7

  def self.create_checkout!(user:)
    new(user).create_checkout!
  end

  def initialize(user)
    @user = user
  end

  def create_checkout!
    ensure_price_configured!
    return portal_url if ClientSubscriptionService.for(user).active?

    customer_id = ensure_customer_id!
    session = Stripe::Checkout::Session.create(
      mode: "subscription",
      customer: customer_id,
      line_items: [{ price: client_price_id, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          user_id: user.id,
          plan: "client"
        }
      },
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        plan: "client"
      }
    )

    session.url
  end

  def portal_url
    ensure_customer_id!
    session = Stripe::BillingPortal::Session.create(
      customer: user.stripe_customer_id,
      return_url: return_url
    )
    session.url
  end

  private

  attr_reader :user

  def ensure_price_configured!
    return if client_price_id.present?

    raise Error, "STRIPE_PRICE_CLIENT_MONTHLY manquant — lancez rails stripe:setup_products"
  end

  def client_price_id
    ENV["STRIPE_PRICE_CLIENT_MONTHLY"]
  end

  def ensure_customer_id!
    return user.stripe_customer_id if user.stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: user.email,
      name: user.full_name.presence,
      metadata: { user_id: user.id, plan: "client" }
    )

    user.update!(stripe_customer_id: customer.id)
    customer.id
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def success_url
    "#{frontend_url}/espace-client?billing=success"
  end

  def cancel_url
    "#{frontend_url}/espace-client?billing=cancelled"
  end

  def return_url
    "#{frontend_url}/espace-client?billing=updated"
  end
end
