# app/serializers/commission_serializer.rb
class CommissionSerializer < AlbaResource
  attributes :id, :amount_cents, :currency, :status, :approved_at, :paid_at,
             :stripe_checkout_session_id, :stripe_transfer_id, :created_at, :updated_at

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
    connect = StripeConnectService.for(merchant).status
    {
      id: merchant.id,
      name: merchant.name,
      slug: merchant.slug,
      stripe_ready: connect[:ready_for_payouts]
    }
  end
end
