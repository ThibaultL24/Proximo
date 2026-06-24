# app/services/stripe_webhook_handler.rb
class StripeWebhookHandler
  def self.call(event)
    new(event).call
  end

  def initialize(event)
    @event = event
  end

  def call
    case event.type
    when "checkout.session.completed"
      handle_checkout_completed(event.data.object)
    when "account.updated"
      handle_account_updated(event.data.object)
    else
      :ignored
    end
  end

  private

  attr_reader :event

  def handle_checkout_completed(session)
    commission_id = session.metadata&.commission_id
    return :ignored if commission_id.blank?

    commission = Commission.find_by(id: commission_id)
    return :ignored unless commission
    return :already_paid if commission.paid?

    payment_intent_id = session.payment_intent

    commission.update!(
      status: :paid,
      paid_at: Time.current,
      stripe_transfer_id: payment_intent_id,
      stripe_checkout_session_id: session.id
    )

    commission.lead.update!(status: :paid) if commission.lead.converted?

    :paid
  end

  def handle_account_updated(account)
    merchant = Merchant.find_by(stripe_account_id: account.id)
    return :ignored unless merchant

    ready = account.charges_enabled && account.payouts_enabled
    merchant.update!(stripe_onboarding_completed: ready) if merchant.stripe_onboarding_completed != ready

    :updated
  end
end
