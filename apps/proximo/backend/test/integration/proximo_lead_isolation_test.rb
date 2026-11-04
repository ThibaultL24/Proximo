require "test_helper"

class ProximoLeadIsolationTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-#{SecureRandom.hex(5)}@test.fr", password: "password123", role: :client)
    @other = User.create!(email: "other-#{SecureRandom.hex(5)}@test.fr", password: "password123", role: :client)
    @member = User.create!(email: "member-#{SecureRandom.hex(5)}@test.fr", password: "password123", role: :client)
    @first = Organization.create!(name: "Agence Alpha", slug: "alpha-#{SecureRandom.hex(4)}", status: :active)
    @second = Organization.create!(name: "Agence Beta", slug: "beta-#{SecureRandom.hex(4)}", status: :active)
    Membership.create!(organization: @first, user: @owner, role: :owner)
    Membership.create!(organization: @second, user: @other, role: :owner)
    Membership.create!(organization: @first, user: @member, role: :member)
    @partner = @first.partners.create!(name: "Alpha Partner", slug: "alpha-partner")
    @foreign_partner = @second.partners.create!(name: "Beta Partner", slug: "beta-partner")
    @lead = @first.leads.create!(
      partner: @partner, submitted_by: @owner, contact_name: "Contact Alpha",
      contact_phone: "0600000000", lead_type: :sell, consent_given: true
    )
    @foreign_lead = @second.leads.create!(
      partner: @foreign_partner, submitted_by: @other, contact_name: "Contact Beta",
      contact_phone: "0600000001", lead_type: :buy, consent_given: true
    )
  end

  test "owner only lists and reads leads of own organization" do
    get "/api/v1/proximo/organizations/#{@first.id}/leads", headers: auth(@owner)
    assert_response :success
    assert_equal [@lead.id], response.parsed_body.map { |row| row.fetch("id") }

    get "/api/v1/proximo/organizations/#{@first.id}/leads/#{@foreign_lead.id}", headers: auth(@owner)
    assert_response :not_found
  end

  test "membership of another organization does not grant access" do
    get "/api/v1/proximo/organizations/#{@second.id}/leads", headers: auth(@owner)
    assert_response :not_found
  end

  test "member cannot see a lead they did not submit" do
    get "/api/v1/proximo/organizations/#{@first.id}/leads", headers: auth(@member)
    assert_response :success
    assert_equal [], response.parsed_body

    get "/api/v1/proximo/organizations/#{@first.id}/leads/#{@lead.id}", headers: auth(@member)
    assert_response :not_found
  end

  test "a partner ID from another organization is rejected" do
    post "/api/v1/proximo/organizations/#{@first.id}/leads",
      params: { lead: valid_attrs.merge(partner_id: @foreign_partner.id) }, headers: auth(@owner)
    assert_response :not_found
    assert_equal 1, @first.leads.count
  end

  test "organization and submitter cannot be forged" do
    post "/api/v1/proximo/organizations/#{@first.id}/leads",
      params: { lead: valid_attrs.merge(organization_id: @second.id, submitted_by_id: @other.id,
                                        agency_id: 123, merchant_id: 987,
                                        partner_id: @partner.id) },
      headers: auth(@member)
    assert_response :created
    row = response.parsed_body
    assert_equal @first.id, row.fetch("organization_id")
    assert_equal @member.id, row.fetch("submitted_by_id")
    assert_equal @partner.id, row.fetch("partner_id")
    lead = Lead.find(row.fetch("id"))
    assert_nil lead.agency_id
    assert_nil lead.merchant_id
  end

  test "unauthenticated requests cannot read organization leads" do
    get "/api/v1/proximo/organizations/#{@first.id}/leads"
    assert_response :unauthorized
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end

  def valid_attrs
    { contact_name: "Nouveau contact", contact_phone: "0600000012",
      lead_type: "sell", consent_given: true }
  end
end
