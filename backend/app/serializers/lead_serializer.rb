# app/serializers/lead_serializer.rb
class LeadSerializer < AlbaResource
  attributes :id, :contact_name, :contact_email, :contact_phone, :lead_type,
             :property_address, :property_city, :description,
             :budget_min, :budget_max, :status, :admin_notes, :consent_given, :created_at

  attribute :merchant do |lead|
    { id: lead.merchant.id, name: lead.merchant.name, slug: lead.merchant.slug }
  end

  attribute :submitted_by do |lead|
    user = lead.submitted_by
    {
      id: user.id,
      full_name: user.full_name.presence || user.email,
      email: user.email
    }
  end

  attribute :status_events do |lead|
    lead.lead_status_events.order(created_at: :desc).map do |event|
      {
        id: event.id,
        from_status: event.from_status,
        to_status: event.to_status,
        note: event.note,
        user_name: event.user&.full_name.presence || event.user&.email,
        created_at: event.created_at
      }
    end
  end
end
