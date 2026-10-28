require "test_helper"
require Rails.root.join("db/migrate/20261027000200_backfill_proximo_organizations").to_s

class ProximoLegacyDataBackfillTest < ActiveSupport::TestCase
  test "imports legacy agency, admin, merchant and lead without duplicating them" do
    agency = create_agency!(slug: "legacy-test-#{SecureRandom.hex(4)}")
    admin = create_user!(agency: agency, role: :admin)
    sector = create_sector!(agency: agency)
    merchant = create_merchant!(agency: agency, sector: sector)
    lead = agency.leads.create!(
      merchant: merchant, submitted_by: admin, contact_name: "Contact",
      contact_phone: "0600000000", lead_type: :sell, consent_given: true
    )

    migration = BackfillProximoOrganizations.new
    migration.backfill_legacy_data!
    organization = Organization.find_by!(legacy_agency_id: agency.id)
    partner = Partner.find_by!(legacy_merchant_id: merchant.id)

    assert_equal agency.slug, organization.slug
    assert_equal organization.id, partner.organization_id
    assert_equal "owner", Membership.find_by!(user: admin, organization: organization).role
    assert_equal organization.id, lead.reload.organization_id
    assert_equal partner.id, lead.partner_id

    migration.backfill_legacy_data!
    assert_equal 1, Organization.where(legacy_agency_id: agency.id).count
    assert_equal 1, Partner.where(legacy_merchant_id: merchant.id).count
    assert_equal 1, Membership.where(user: admin, organization: organization).count
  end
end
