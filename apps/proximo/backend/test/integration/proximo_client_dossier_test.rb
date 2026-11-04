require "test_helper"

class ProximoClientDossierTest < ActionDispatch::IntegrationTest
  setup do
    @first = Organization.create!(name: "Cabinet A", slug: "cabinet-a-#{SecureRandom.hex(5)}", status: :active)
    @second = Organization.create!(name: "Cabinet B", slug: "cabinet-b-#{SecureRandom.hex(5)}", status: :active)
    @owner = User.create!(email: "owner-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    @outsider = User.create!(email: "other-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    @member = User.create!(email: "member-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    Membership.create!(organization: @first, user: @owner, role: :owner)
    Membership.create!(organization: @second, user: @outsider, role: :owner)
    Membership.create!(organization: @first, user: @member, role: :member)
    @url = "/api/v1/proximo/organizations/#{@first.id}/client_dossiers"
  end

  test "organization owner creates and reads an isolated requirements dossier" do
    post @url, headers: auth(@owner), params: { client_dossier: params_data.merge(organization_id: @second.id, created_by_id: @outsider.id, mandate_status: "verifie") }
    assert_response :created
    dossier = ClientDossier.last
    assert_equal @first.id, dossier.organization_id
    assert_equal @owner.id, dossier.created_by_id
    assert_equal "non_recu", dossier.mandate_status
    assert dossier.consent_recorded_at.present?
    get "#{@url}/#{dossier.id}", headers: auth(@owner)
    assert_response :success
    get "/api/v1/proximo/organizations/#{@second.id}/client_dossiers/#{dossier.id}", headers: auth(@outsider)
    assert_response :not_found
  end

  test "member cannot access personal information" do
    post @url, headers: auth(@owner), params: { client_dossier: params_data }
    assert_response :created
    dossier = ClientDossier.last
    get "#{@url}/#{dossier.id}", headers: auth(@member)
    assert_response :forbidden
  end

  test "consent is required before collecting a client dossier" do
    post @url, headers: auth(@owner), params: { client_dossier: params_data.merge(data_consent: false) }
    assert_response :unprocessable_entity
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end

  def params_data
    { full_name: "Client test", email: "client@example.org", project_type: "achat",
      property_city: "Avignon", budget_min: 200_000, budget_max: 300_000,
      requirements: "T3 proche centre-ville", data_consent: true }
  end
end
