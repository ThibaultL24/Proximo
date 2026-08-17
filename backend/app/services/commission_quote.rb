# app/services/commission_quote.rb
class CommissionQuote
  PLATFORM_FEE_BPS = 1_000
  MIN_BUY_CENTS = 5_000
  MAX_BUY_CENTS = 30_000
  FLAT_CENTS = {
    "sell" => 15_000,
    "rent" => 8_000,
    "other" => 5_000
  }.freeze

  def self.for(lead)
    amount_cents = quoted_amount(lead)
    platform_fee_cents = (amount_cents * PLATFORM_FEE_BPS / 10_000.0).round

    {
      amount_cents: amount_cents,
      platform_fee_cents: platform_fee_cents,
      merchant_amount_cents: amount_cents - platform_fee_cents,
      currency: "EUR",
      label: label_for(lead)
    }
  end

  def self.quoted_amount(lead)
    return buy_amount(lead) if lead.buy?

    FLAT_CENTS.fetch(lead.lead_type, FLAT_CENTS["other"])
  end

  def self.buy_amount(lead)
    budget_euros = lead.budget_max.presence || lead.budget_min.presence
    return 15_000 if budget_euros.blank?

    percent_cents = (budget_euros * 100 * 0.01).round
    percent_cents.clamp(MIN_BUY_CENTS, MAX_BUY_CENTS)
  end

  def self.label_for(lead)
    return "1 % du budget (min 50 €, max 300 €)" if lead.buy?

    "Forfait #{lead.lead_type}"
  end

  private_class_method :quoted_amount, :buy_amount, :label_for
end
