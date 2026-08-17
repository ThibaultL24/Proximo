# db/seeds/demo_enrichment.rb
module DemoEnrichment
  module_function

  def call(agency:, merchant:, client:, admin:)
    seed_qr_scans!(merchant)
    seed_client_subscription!(client)
    seed_merchant_stripe_connect!(merchant)
    seed_leads_and_commissions!(agency:, merchant:, client:, admin:)
  end

  def seed_qr_scans!(merchant)
    return if merchant.qr_scans.count >= 8

    sessions = %w[scan-a scan-b scan-c scan-d scan-e scan-f scan-g scan-h scan-i scan-j scan-k scan-l]
    sessions.each_with_index do |session_id, index|
      created_at = (index < 4 ? rand(1..5).days.ago : rand(8..21).days.ago)
      QrScanRecorder.record!(
        merchant: merchant,
        session_id: session_id,
        remote_ip: "192.0.2.#{index + 1}",
        user_agent: "DemoSeed/1.0",
        referer: "https://fenetreouverte.fr/qr/#{merchant.qr_token}"
      )
      merchant.qr_scans.order(:id).last&.update_column(:created_at, created_at)
    end

    merchant.reload
    puts "  QR scans: #{merchant.qr_scan_count} pour #{merchant.name}"
  end

  def seed_client_subscription!(client)
    client.update!(
      subscription_status: "active",
      stripe_customer_id: client.stripe_customer_id.presence || "cus_demo_client_07700",
      stripe_subscription_id: client.stripe_subscription_id.presence || "sub_demo_client_07700",
      subscription_current_period_end: 1.month.from_now,
      subscription_trial_ends_at: nil
    )
  end

  def seed_merchant_stripe_connect!(merchant)
    merchant.update!(
      stripe_account_id: merchant.stripe_account_id.presence || "acct_demo_martin_07700",
      stripe_onboarding_completed: true
    )
  end

  def seed_leads_and_commissions!(agency:, merchant:, client:, admin:)
    pipeline_lead = find_or_seed_lead!(
      agency: agency,
      merchant: merchant,
      client: client,
      key: "pipeline-achat-maison",
      attrs: {
        contact_name: "Marie Dupont",
        contact_email: client.email,
        contact_phone: "0612345678",
        lead_type: :buy,
        property_city: "Bourg-Saint-Andéol",
        description: "Recherche maison de village avec jardin, budget 180 000 €.",
        budget_min: 150_000,
        budget_max: 200_000,
        status: :qualified,
        qualified_at: 3.days.ago,
        consent_given: true
      }
    )
    record_event_if_missing!(pipeline_lead, admin, "received", "qualified", "Lead qualifie apres appel")

    eligible_lead = find_or_seed_lead!(
      agency: agency,
      merchant: merchant,
      client: client,
      key: "commission-eligible-martin",
      attrs: {
        contact_name: "Pierre Leroy",
        contact_email: "pierre.leroy@example.com",
        contact_phone: "0678901234",
        lead_type: :sell,
        property_address: "8 chemin des Oliviers",
        property_city: "Bourg-Saint-Andéol",
        description: "Vente maison de village — recommande par scan QR Boulangerie Martin.",
        status: :converted,
        qualified_at: 2.weeks.ago,
        converted_at: 10.days.ago,
        consent_given: true
      }
    )
    commission = ensure_commission!(eligible_lead, status: :eligible)

    approved_lead = find_or_seed_lead!(
      agency: agency,
      merchant: merchant,
      client: client,
      key: "commission-approved-martin",
      attrs: {
        contact_name: "Sophie Bernard",
        contact_email: "sophie.bernard@example.com",
        contact_phone: "0687654321",
        lead_type: :rent,
        property_city: "Saint-Marcel-d'Ardeche",
        description: "Location saisonniere — contact via fiche commercant.",
        status: :converted,
        qualified_at: 3.weeks.ago,
        converted_at: 2.weeks.ago,
        consent_given: true
      }
    )
    ensure_commission!(approved_lead, status: :approved, approved_at: 1.week.ago)

    paid_lead = find_or_seed_lead!(
      agency: agency,
      merchant: nil,
      client: client,
      key: "commission-paid-agency",
      attrs: {
        contact_name: "Luc Moreau",
        contact_email: "luc.moreau@example.com",
        contact_phone: "0699887766",
        lead_type: :other,
        property_city: "Bourg-Saint-Andéol",
        description: "Demande directe agence — estimation bien familial.",
        status: :paid,
        qualified_at: 1.month.ago,
        converted_at: 3.weeks.ago,
        consent_given: true
      }
    )
    ensure_commission!(paid_lead, status: :paid, approved_at: 2.weeks.ago, paid_at: 1.week.ago)

    puts "  Leads: #{agency.leads.count} · Commissions: #{Commission.joins(:lead).where(leads: { agency_id: agency.id }).count}"
    puts "  Commission demo: eligible ##{commission.id}, approved, paid"
  end

  def find_or_seed_lead!(agency:, merchant:, client:, key:, attrs:)
    description = "[seed:#{key}] #{attrs[:description]}"
    lead = agency.leads.find_by("description LIKE ?", "%[seed:#{key}]%")
    lead ||= agency.leads.create!(
      attrs.merge(
        agency: agency,
        merchant: merchant,
        submitted_by: client,
        description: description
      )
    )
    lead.update!(attrs.merge(description: description, merchant: merchant))
    lead
  end

  def ensure_commission!(lead, status:, approved_at: nil, paid_at: nil)
    quote = CommissionQuote.for(lead)
    commission = lead.commission || CommissionCreator.create_for_converted_lead!(lead: lead)
    commission.update!(
      amount_cents: quote[:amount_cents],
      platform_fee_cents: quote[:platform_fee_cents],
      status: status,
      approved_at: approved_at,
      paid_at: paid_at,
      stripe_account_id: lead.merchant&.stripe_account_id,
      stripe_transfer_id: paid_at ? "tr_demo_#{lead.id}" : nil
    )
    commission
  end

  def record_event_if_missing!(lead, user, from_status, to_status, note)
    return if lead.lead_status_events.exists?(to_status: to_status)

    LeadStatusRecorder.record!(
      lead: lead,
      user: user,
      from_status: from_status,
      to_status: to_status,
      note: note
    )
  end
end
