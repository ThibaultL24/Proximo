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
    when "customer.subscription.created", "customer.subscription.updated"
      handle_subscription_updated(event.data.object)
    when "customer.subscription.deleted"
      handle_subscription_deleted(event.data.object)
    when "invoice.paid"
      handle_invoice_paid(event.data.object)
    when "invoice.payment_failed"
      handle_invoice_payment_failed(event.data.object)
    when "account.updated"
      handle_account_updated(event.data.object)
    else
      :ignored
    end
  end

  private

  attr_reader :event

  def handle_checkout_completed(session)
    if session.mode == "subscription"
      return handle_subscription_checkout_completed(session)
    end

    shop_order_id = session.metadata&.shop_order_id
    if shop_order_id.present?
      return handle_boutique_order_completed(session, shop_order_id)
    end

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

  def handle_boutique_order_completed(session, shop_order_id)
    order = ShopOrder.find_by(id: shop_order_id)
    return :ignored unless order
    return :already_paid if order.paid?

    order.update!(
      status: :paid,
      stripe_payment_intent_id: session.payment_intent,
      customer_email: session.customer_details&.email || order.customer_email
    )

    :boutique_paid
  end

  def handle_subscription_checkout_completed(session)
    plan = session.metadata&.plan
    subscription_id = session.subscription
    return :ignored if subscription_id.blank?

    subscription = Stripe::Subscription.retrieve(subscription_id)

    case plan
    when "merchant"
      merchant = find_merchant_from_metadata(session.metadata)
      return :ignored unless merchant

      MerchantSubscriptionService.for(merchant).sync_from_stripe!(subscription)
      :merchant_subscription_activated
    when "client"
      user = find_user_from_metadata(session.metadata)
      return :ignored unless user

      ClientSubscriptionService.for(user).sync_from_stripe!(subscription)
      :client_subscription_activated
    when "agency"
      agency = find_agency_from_metadata(session.metadata)
      return :ignored unless agency

      AgencySubscriptionService.for(agency).sync_from_stripe!(subscription)
      :agency_subscription_activated
    else
      :ignored
    end
  end

  def handle_subscription_updated(subscription)
    plan = subscription.metadata&.plan

    case plan
    when "merchant"
      merchant = find_merchant_from_subscription(subscription)
      return :ignored unless merchant

      MerchantSubscriptionService.for(merchant).sync_from_stripe!(subscription)
      :merchant_subscription_updated
    when "client"
      user = find_user_from_subscription(subscription)
      return :ignored unless user

      ClientSubscriptionService.for(user).sync_from_stripe!(subscription)
      :client_subscription_updated
    when "agency"
      agency = find_agency_from_subscription(subscription)
      return :ignored unless agency

      AgencySubscriptionService.for(agency).sync_from_stripe!(subscription)
      :agency_subscription_updated
    else
      sync_subscription_by_lookup(subscription)
    end
  end

  def handle_subscription_deleted(subscription)
    plan = subscription.metadata&.plan

    case plan
    when "merchant"
      merchant = find_merchant_from_subscription(subscription)
      return :ignored unless merchant

      merchant.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil
      )
      MerchantSubscriptionService.for(merchant).refresh_publication_status!
      :merchant_subscription_canceled
    when "client"
      user = find_user_from_subscription(subscription)
      return :ignored unless user

      user.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil
      )
      :client_subscription_canceled
    when "agency"
      agency = find_agency_from_subscription(subscription)
      return :ignored unless agency

      agency.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil,
        status: :suspended
      )
      :agency_subscription_canceled
    else
      sync_subscription_deletion_by_lookup(subscription)
    end
  end

  def handle_invoice_paid(invoice)
    subscription_id = invoice.subscription
    return :ignored if subscription_id.blank?

    subscription = Stripe::Subscription.retrieve(subscription_id)
    handle_subscription_updated(subscription)
  end

  def handle_invoice_payment_failed(invoice)
    subscription_id = invoice.subscription
    return :ignored if subscription_id.blank?

    subscription = Stripe::Subscription.retrieve(subscription_id)
    handle_subscription_updated(subscription)
  end

  def find_merchant_from_metadata(metadata)
    merchant_id = metadata&.merchant_id
    return Merchant.find_by(id: merchant_id) if merchant_id.present?

    nil
  end

  def find_merchant_from_subscription(subscription)
    merchant_id = subscription.metadata&.merchant_id
    merchant = Merchant.find_by(id: merchant_id) if merchant_id.present?
    return merchant if merchant

    Merchant.find_by(stripe_subscription_id: subscription.id) ||
      Merchant.find_by(stripe_customer_id: subscription.customer)
  end

  def find_user_from_metadata(metadata)
    user_id = metadata&.user_id
    return User.find_by(id: user_id) if user_id.present?

    nil
  end

  def find_user_from_subscription(subscription)
    user_id = subscription.metadata&.user_id
    user = User.find_by(id: user_id) if user_id.present?
    return user if user

    User.find_by(stripe_subscription_id: subscription.id) ||
      User.find_by(stripe_customer_id: subscription.customer)
  end

  def find_agency_from_metadata(metadata)
    agency_id = metadata&.agency_id
    return Agency.find_by(id: agency_id) if agency_id.present?

    nil
  end

  def find_agency_from_subscription(subscription)
    agency_id = subscription.metadata&.agency_id
    agency = Agency.find_by(id: agency_id) if agency_id.present?
    return agency if agency

    Agency.find_by(stripe_subscription_id: subscription.id) ||
      Agency.find_by(stripe_customer_id: subscription.customer)
  end

  def sync_subscription_by_lookup(subscription)
    if (merchant = find_merchant_from_subscription(subscription))
      MerchantSubscriptionService.for(merchant).sync_from_stripe!(subscription)
      return :merchant_subscription_updated
    end

    if (user = find_user_from_subscription(subscription))
      ClientSubscriptionService.for(user).sync_from_stripe!(subscription)
      return :client_subscription_updated
    end

    if (agency = find_agency_from_subscription(subscription))
      AgencySubscriptionService.for(agency).sync_from_stripe!(subscription)
      return :agency_subscription_updated
    end

    :ignored
  end

  def sync_subscription_deletion_by_lookup(subscription)
    if (merchant = find_merchant_from_subscription(subscription))
      merchant.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil
      )
      MerchantSubscriptionService.for(merchant).refresh_publication_status!
      return :merchant_subscription_canceled
    end

    if (user = find_user_from_subscription(subscription))
      user.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil
      )
      return :client_subscription_canceled
    end

    if (agency = find_agency_from_subscription(subscription))
      agency.update!(
        subscription_status: "canceled",
        subscription_current_period_end: Time.zone.at(subscription.current_period_end),
        subscription_trial_ends_at: nil,
        status: :suspended
      )
      return :agency_subscription_canceled
    end

    :ignored
  end

  def handle_account_updated(account)
    merchant = Merchant.find_by(stripe_account_id: account.id)
    return :ignored unless merchant

    ready = account.charges_enabled && account.payouts_enabled
    merchant.update!(stripe_onboarding_completed: ready) if merchant.stripe_onboarding_completed != ready

    :updated
  end
end
