require "test_helper"

class ProximoOrganizationIsolationTest < ActionDispatch::IntegrationTest
  setup do
    @alice = User.create!(email: "alice-#{SecureRandom.hex(5)}@test.fr", password: "password123", role: :client)
    @bob = User.create!(email: "bob-#{SecureRandom.hex(5)}@test.fr", password: "password123", role: :client)
    @first = Organization.create!(name: "Agence A", slug: "agence-a-#{SecureRandom.hex(4)}", status: :active)
    @second = Organization.create!(name: "Agence B", slug: "agence-b-#{SecureRandom.hex(4)}", status: :active)
    Membership.create!(user: @alice, organization: @first, role: :owner)
    Membership.create!(user: @bob, organization: @second, role: :owner)
    @partner_a = @first.partners.create!(name: "Partenaire A", slug: "partenaire-a", status: :active)
    @partner_b = @second.partners.create!(name: "Partenaire B", slug: "partenaire-b", status: :active)
  end

  test "a user only lists their own organization" do
    get "/api/v1/proximo/organizations", headers: auth(@alice)
    assert_response :success
    assert_equal [@first.id], response.parsed_body.map { |row| row.fetch("id") }
  end

  test "a direct ID for another organization is not accessible" do
    get "/api/v1/proximo/organizations/#{@second.id}", headers: auth(@alice)
    assert_response :not_found
  end

  test "a user cannot read or mutate another organization's partners" do
    base = "/api/v1/proximo/organizations/#{@first.id}/partners"
    get "#{base}/#{@partner_b.id}", headers: auth(@alice)
    assert_response :not_found

    patch "#{base}/#{@partner_b.id}", params: { partner: { name: "Intrusion" } }, headers: auth(@alice)
    assert_response :not_found
    assert_equal "Partenaire B", @partner_b.reload.name
  end

  test "a user without membership cannot enumerate another organization's partners" do
    get "/api/v1/proximo/organizations/#{@second.id}/partners", headers: auth(@alice)
    assert_response :not_found
  end

  test "a normal member cannot create or update partners" do
    Membership.find_by!(user: @alice, organization: @first).update!(role: :member)
    base = "/api/v1/proximo/organizations/#{@first.id}/partners"

    post base, params: { partner: { name: "Tiers", slug: "tiers" } }, headers: auth(@alice)
    assert_response :forbidden
    patch "#{base}/#{@partner_a.id}", params: { partner: { name: "Modifie" } }, headers: auth(@alice)
    assert_response :forbidden
    assert_equal "Partenaire A", @partner_a.reload.name
  end

  test "an owner can create a partner in their organization" do
    post "/api/v1/proximo/organizations/#{@first.id}/partners",
      params: { partner: { name: "Tiers", slug: "tiers" } }, headers: auth(@alice)
    assert_response :created
    assert_equal @first.id, response.parsed_body.fetch("organization_id")
    assert_equal 2, @first.partners.count
    assert_equal 1, @second.partners.count
  end

  test "no token returns unauthorized" do
    get "/api/v1/proximo/organizations/#{@first.id}/partners"
    assert_response :unauthorized
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: user.id)}" }
  end
end
