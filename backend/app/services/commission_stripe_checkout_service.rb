# app/services/commission_stripe_checkout_service.rb
class CommissionStripeCheckoutService
  class Error < StandardError; end

  def self.create_checkout!(commission:)
    new(commission).create_checkout!
  end

  def initialize(commission)
    @commission = commission
  end

  def create_checkout!
    validate!

    merchant = commission.lead.merchant
    connect = StripeConnectService.for(merchant).status
    unless connect[:ready_for_payouts]
      raise Error, "Le commercant doit terminer la configuration Stripe avant le paiement"
    end

    session = Stripe::Checkout::Session.create(
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: commission.currency.downcase,
            unit_amount: commission.amount_cents,
            product_data: {
              name: "Commission Proxi Immo",
              description: "#{merchant.name} — lead #{commission.lead.contact_name}"
            }
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        transfer_data: {
          destination: merchant.stripe_account_id
        },
        metadata: {
          commission_id: commission.id,
          lead_id: commission.lead_id,
          merchant_id: merchant.id
        }
      },
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        commission_id: commission.id
      }
    )

    commission.update!(
      stripe_checkout_session_id: session.id,
      stripe_account_id: merchant.stripe_account_id
    )

    session.url
  end

  private

  attr_reader :commission

  def validate!
    raise Error, "La commission doit etre approuvee avant paiement" unless commission.approved?
    raise Error, "Montant invalide" unless commission.amount_cents.positive?
    raise Error, "Cette commission est deja payee" if commission.paid?
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def success_url
    "#{frontend_url}/admin/commissions?payment=success&commission_id=#{commission.id}"
  end

  def cancel_url
    "#{frontend_url}/admin/commissions?payment=cancelled&commission_id=#{commission.id}"
  end
end
