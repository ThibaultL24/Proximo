# app/services/commission_creator.rb
class CommissionCreator
  DEFAULT_AMOUNT_CENTS = 0

  def self.create_for_converted_lead!(lead:, amount_cents: nil)
    return lead.commission if lead.commission.present?

    lead.create_commission!(
      amount_cents: amount_cents.presence || DEFAULT_AMOUNT_CENTS,
      currency: "EUR",
      status: :eligible
    )
  end
end
