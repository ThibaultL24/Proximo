# app/services/agency_subscription_checkout_service.rb
class AgencySubscriptionCheckoutService
  class Error < StandardError; end

  TRIAL_DAYS = 14

  def self.create_checkout!(agency:, user:)
    new(agency, user).create_checkout!
  end

  def initialize(agency, user)
    @agency = agency
    @user = user
  end

  def create_checkout!
    ensure_price_configured!
    return portal_url if AgencySubscriptionService.for(agency).active?

    customer_id = ensure_customer_id!
    session = Stripe::Checkout::Session.create(
      mode: "subscription",
      customer: customer_id,
      line_items: [{ price: agency_price_id, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          agency_id: agency.id,
          user_id: user.id,
          plan: "agency"
        }
      },
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        agency_id: agency.id,
        user_id: user.id,
        plan: "agency"
      }
    )

    session.url
  end

  def portal_url
    ensure_customer_id!
    session = Stripe::BillingPortal::Session.create(
      customer: agency.stripe_customer_id,
      return_url: return_url
    )
    session.url
  end

  private

  attr_reader :agency, :user

  def ensure_price_configured!
    return if agency_price_id.present?

    raise Error, "STRIPE_PRICE_AGENCY_MONTHLY manquant — lancez rails stripe:setup_products"
  end

  def agency_price_id
    ENV["STRIPE_PRICE_AGENCY_MONTHLY"]
  end

  def ensure_customer_id!
    return agency.stripe_customer_id if agency.stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: user.email,
      name: agency.name,
      metadata: {
        agency_id: agency.id,
        user_id: user.id,
        plan: "agency"
      }
    )

    agency.update!(stripe_customer_id: customer.id)
    customer.id
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def success_url
    "#{frontend_url}/admin?billing=success"
  end

  def cancel_url
    "#{frontend_url}/admin?billing=cancelled"
  end

  def return_url
    "#{frontend_url}/admin?billing=updated"
  end
end
