# app/services/client_subscription_service.rb
class ClientSubscriptionService
  ACTIVE_STATUSES = %w[trialing active].freeze

  def self.for(user)
    new(user)
  end

  def initialize(user)
    @user = user
  end

  def status
    {
      plan: "client",
      status: user.subscription_status,
      active: active?,
      trial_ends_at: user.subscription_trial_ends_at,
      current_period_end: user.subscription_current_period_end,
      price_label: "2 € / mois",
      features_locked: !active?
    }
  end

  def active?
    user.subscription_status.present? && ACTIVE_STATUSES.include?(user.subscription_status)
  end

  def sync_from_stripe!(subscription)
    user.update!(
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: Time.zone.at(subscription.current_period_end),
      subscription_trial_ends_at: subscription.trial_end ? Time.zone.at(subscription.trial_end) : nil
    )
    user
  end

  private

  attr_reader :user
end
