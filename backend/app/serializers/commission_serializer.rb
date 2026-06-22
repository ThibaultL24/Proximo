# app/serializers/commission_serializer.rb
class CommissionSerializer < AlbaResource
  attributes :id, :amount_cents, :currency, :status, :approved_at, :paid_at, :created_at, :updated_at

  attribute :lead do |commission|
    lead = commission.lead
    {
      id: lead.id,
      contact_name: lead.contact_name,
      status: lead.status,
      lead_type: lead.lead_type
    }
  end

  attribute :merchant do |commission|
    merchant = commission.lead.merchant
    {
      id: merchant.id,
      name: merchant.name,
      slug: merchant.slug
    }
  end
end
