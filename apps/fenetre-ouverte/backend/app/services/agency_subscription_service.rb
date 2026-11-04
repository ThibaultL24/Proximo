# app/services/agency_subscription_service.rb
class AgencySubscriptionService
  ACTIVE_STATUSES = %w[trialing active].freeze

  def self.for(agency)
    new(agency)
  end

  def initialize(agency)
    @agency = agency
  end

  def status
    {
      plan: "agency",
      status: agency.subscription_status,
      active: active?,
      trial_ends_at: agency.subscription_trial_ends_at,
      current_period_end: agency.subscription_current_period_end,
      price_label: "125 € / mois",
      features_locked: !active?
    }
  end

  def active?
    agency.subscription_status.present? && ACTIVE_STATUSES.include?(agency.subscription_status)
  end

  def sync_from_stripe!(subscription)
    agency.update!(
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: Time.zone.at(subscription.current_period_end),
      subscription_trial_ends_at: subscription.trial_end ? Time.zone.at(subscription.trial_end) : nil,
      status: :active
    )
    agency
  end

  private

  attr_reader :agency
end
