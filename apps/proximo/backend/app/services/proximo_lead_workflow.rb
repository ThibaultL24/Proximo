# Transition boundaries for the new Proximo domain, independent of Merchant/Agency.
class ProximoLeadWorkflow
  class InvalidTransition < StandardError; end

  ALLOWED = {
    "received" => %w[qualified rejected],
    "qualified" => %w[in_progress converted rejected],
    "in_progress" => %w[converted rejected]
  }.freeze

  def self.transition!(lead:, actor:, to:, note: nil, amount_cents: nil)
    requested = to.to_s
    lead.with_lock do
      from = lead.status
      unless ALLOWED.fetch(from, []).include?(requested)
        raise InvalidTransition, "Transition impossible : #{from} -> #{requested}"
      end

      if requested == "converted" && amount_cents.present? &&
         (!amount_cents.to_s.match?(/\A\d+\z/) || amount_cents.to_i <= 0)
        raise InvalidTransition, "Montant de commission invalide"
      end

      timestamp = case requested
                  when "qualified" then { qualified_at: Time.current }
                  when "converted" then { converted_at: Time.current }
                  when "rejected" then { rejected_at: Time.current }
                  else {}
                  end

      attrs = { status: requested, **timestamp }
      attrs[:rejection_reason] = note if requested == "rejected"
      lead.update!(attrs)

      LeadStatusRecorder.record!(
        lead: lead, user: actor, from_status: from, to_status: requested, note: note
      )

      if requested == "converted"
        CommissionCreator.create_for_converted_lead!(lead: lead, amount_cents: amount_cents)
      end
    end
    lead
  end
end
