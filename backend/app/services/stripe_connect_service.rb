# app/services/stripe_connect_service.rb
class StripeConnectService
  def self.for(merchant)
    new(merchant)
  end

  def initialize(merchant)
    @merchant = merchant
  end

  def status
    return disconnected_status unless merchant.stripe_account_id.present?

    account = Stripe::Account.retrieve(merchant.stripe_account_id)
    charges_enabled = account.charges_enabled
    payouts_enabled = account.payouts_enabled
    details_submitted = account.details_submitted

    merchant.update!(stripe_onboarding_completed: charges_enabled && payouts_enabled) if merchant.stripe_onboarding_completed != (charges_enabled && payouts_enabled)

    {
      connected: true,
      account_id: merchant.stripe_account_id,
      charges_enabled: charges_enabled,
      payouts_enabled: payouts_enabled,
      details_submitted: details_submitted,
      ready_for_payouts: charges_enabled && payouts_enabled
    }
  rescue Stripe::StripeError => e
    Rails.logger.warn("Stripe account retrieve failed: #{e.message}")
    disconnected_status
  end

  def create_onboarding_link!
    account_id = ensure_account!

    Stripe::AccountLink.create(
      account: account_id,
      refresh_url: onboarding_refresh_url,
      return_url: onboarding_return_url,
      type: "account_onboarding"
    ).url
  end

  def create_dashboard_link!
    return nil unless merchant.stripe_account_id.present?

    Stripe::Account.create_login_link(merchant.stripe_account_id).url
  rescue Stripe::StripeError
    nil
  end

  private

  attr_reader :merchant

  def ensure_account!
    return merchant.stripe_account_id if merchant.stripe_account_id.present?

    account = Stripe::Account.create(
      type: "express",
      country: "FR",
      email: merchant.email.presence,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: {
        merchant_id: merchant.id,
        merchant_slug: merchant.slug
      }
    )

    merchant.update!(stripe_account_id: account.id)
    account.id
  end

  def disconnected_status
    {
      connected: false,
      account_id: nil,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
      ready_for_payouts: false
    }
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def onboarding_return_url
    "#{frontend_url}/espace-commercant/ma-fiche?stripe=success"
  end

  def onboarding_refresh_url
    "#{frontend_url}/espace-commercant/ma-fiche?stripe=refresh"
  end
end
