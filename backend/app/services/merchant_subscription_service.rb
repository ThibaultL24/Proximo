# app/services/merchant_subscription_service.rb
class MerchantSubscriptionService
  ACTIVE_STATUSES = %w[trialing active].freeze

  def self.for(merchant)
    new(merchant)
  end

  def initialize(merchant)
    @merchant = merchant
  end

  def status
    {
      plan: "merchant",
      status: merchant.subscription_status,
      active: active?,
      trial_ends_at: merchant.subscription_trial_ends_at,
      current_period_end: merchant.subscription_current_period_end,
      price_label: "19 € / mois — fil local + reseaux sociaux",
      features_locked: !active?
    }
  end

  def active?
    merchant.subscription_status.present? && ACTIVE_STATUSES.include?(merchant.subscription_status)
  end

  def sync_from_stripe!(subscription)
    attrs = {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: Time.zone.at(subscription.current_period_end),
      subscription_trial_ends_at: subscription.trial_end ? Time.zone.at(subscription.trial_end) : nil
    }

    merchant.update!(attrs)
    refresh_publication_status!
    merchant
  end

  def refresh_publication_status!
    publish_if_eligible!
    unpublish_if_inactive!
  end

  private

  attr_reader :merchant

  def publish_if_eligible!
    return unless active?
    return if merchant.published?

    merchant.update!(status: :published)
  end

  def unpublish_if_inactive!
    return if active?
    return unless merchant.published?

    merchant.update!(status: :draft)
  end
end
