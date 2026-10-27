require "test_helper"

class ProximoLeadWorkflowTest < ActionDispatch::IntegrationTest
  setup do
    @organization = Organization.create!(
      name: "Agence Workflow", slug: "workflow-#{SecureRandom.hex(5)}", status: :active
    )
    @other_organization = Organization.create!(
      name: "Agence Autre", slug: "autre-#{SecureRandom.hex(5)}", status: :active
    )
    @owner = User.create!(email: "owner-#{SecureRandom.hex(6)}@test.fr", password: "password123", role: :client)
    @member = User.create!(email: "member-#{SecureRandom.hex(6)}@test.fr", password: "password123", role: :client)
    @other_owner = User.create!(email: "other-#{SecureRandom.hex(6)}@test.fr", password: "password123", role: :client)
    Membership.create!(user: @owner, organization: @organization, role: :owner)
    Membership.create!(user: @member, organization: @organization, role: :member)
    Membership.create!(user: @other_owner, organization: @other_organization, role: :owner)
    @lead = @organization.leads.create!(
      submitted_by: @member, contact_name: "Lead test", contact_phone: "0600000000",
      lead_type: :sell, consent_given: true
    )
    @other_lead = @other_organization.leads.create!(
      submitted_by: @other_owner, contact_name: "Lead autre", contact_phone: "0600000001",
      lead_type: :sell, consent_given: true
    )
    @lead_url = "/api/v1/proximo/organizations/#{@organization.id}/leads/#{@lead.id}"
    @commission_url = "/api/v1/proximo/organizations/#{@organization.id}/commissions"
  end

  test "an owner qualifies then converts a lead and creates one commission and audit trail" do
    patch "#{@lead_url}/qualify", params: { note: "Contact confirme" }, headers: auth(@owner)
    assert_response :success
    assert_equal "qualified", @lead.reload.status

    patch "#{@lead_url}/convert", params: { amount_cents: 18_000 }, headers: auth(@owner)
    assert_response :success
    assert_equal "converted", @lead.reload.status
    assert_equal 18_000, @lead.commission.amount_cents
    assert_equal 1_800, @lead.commission.platform_fee_cents
    assert_equal %w[qualified converted], @lead.lead_status_events.order(:created_at).pluck(:to_status)

    get @commission_url, headers: auth(@owner)
    assert_response :success
    assert_equal [@lead.commission.id], response.parsed_body.map { |row| row.fetch("id") }

    get "#{@commission_url}/#{@lead.commission.id}", headers: auth(@owner)
    assert_response :success
  end

  test "member cannot change lead status or list commissions" do
    patch "#{@lead_url}/qualify", headers: auth(@member)
    assert_response :forbidden

    get @commission_url, headers: auth(@member)
    assert_response :forbidden
    assert_equal "received", @lead.reload.status
  end

  test "a lead from another tenant cannot be transitioned" do
    patch "/api/v1/proximo/organizations/#{@organization.id}/leads/#{@other_lead.id}/qualify",
      headers: auth(@owner)
    assert_response :not_found
    assert_equal "received", @other_lead.reload.status
  end

  test "another tenant's commission cannot be opened by ID" do
    other_commission = @other_lead.create_commission!(
      amount_cents: 15_000, platform_fee_cents: 1_500, currency: "EUR", status: :eligible
    )
    get "#{@commission_url}/#{other_commission.id}", headers: auth(@owner)
    assert_response :not_found
  end

  test "invalid transitions do not create a commission or duplicate status changes" do
    patch "#{@lead_url}/convert", headers: auth(@owner)
    assert_response :unprocessable_entity
    assert_equal "received", @lead.reload.status
    assert_nil @lead.commission

    patch "#{@lead_url}/qualify", headers: auth(@owner)
    assert_response :success
    patch "#{@lead_url}/convert", params: { amount_cents: "-1" }, headers: auth(@owner)
    assert_response :unprocessable_entity
    assert_equal "qualified", @lead.reload.status
  end

  test "reject records its reason and prevents reopening" do
    patch "#{@lead_url}/reject", params: { reason: "Dossier incomplet" }, headers: auth(@owner)
    assert_response :success
    assert_equal "rejected", @lead.reload.status
    assert_equal "Dossier incomplet", @lead.rejection_reason
    patch "#{@lead_url}/qualify", headers: auth(@owner)
    assert_response :unprocessable_entity
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
