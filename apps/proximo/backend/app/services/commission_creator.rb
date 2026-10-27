# app/services/commission_creator.rb
class CommissionCreator
  def self.create_for_converted_lead!(lead:, amount_cents: nil)
    return lead.commission if lead.commission.present?

    quote = CommissionQuote.for(lead)
    resolved_amount = amount_cents.presence&.to_i
    resolved_amount = quote[:amount_cents] unless resolved_amount&.positive?
    platform_fee = (resolved_amount * CommissionQuote::PLATFORM_FEE_BPS / 10_000.0).round

    lead.create_commission!(
      amount_cents: resolved_amount,
      platform_fee_cents: platform_fee,
      currency: quote[:currency],
      status: :eligible
    )
  end
end
