# app/services/lead_status_recorder.rb
class LeadStatusRecorder
  def self.record!(lead:, user:, from_status:, to_status:, note: nil)
    lead.lead_status_events.create!(
      user: user,
      from_status: from_status,
      to_status: to_status,
      note: note
    )
  end
end
