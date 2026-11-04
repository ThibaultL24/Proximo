require "test_helper"
require "csv"

class PropertyListingsDistributionTest < ActionDispatch::IntegrationTest
  setup do
    @first = Organization.create!(name: "Agence A", slug: "agence-a-#{SecureRandom.hex(4)}", status: :active)
    @second = Organization.create!(name: "Agence B", slug: "agence-b-#{SecureRandom.hex(4)}", status: :active)
    @owner = User.create!(email: "owner-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    @outsider = User.create!(email: "outsider-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    @member = User.create!(email: "member-#{SecureRandom.hex(4)}@demo.fr", password: "password123", role: :client)
    Membership.create!(organization: @first, user: @owner, role: :owner)
    Membership.create!(organization: @first, user: @member, role: :member)
    Membership.create!(organization: @second, user: @outsider, role: :owner)
    @url = "/api/v1/proximo/organizations/#{@first.id}/property_listings"
  end

  test "draft belongs exclusively to organization and is not sent to a portal" do
    post @url, params: { property_listing: valid_listing.merge(status: "ready", organization_id: @second.id, created_by_id: @outsider.id) }, headers: auth(@owner)
    assert_response :created

    listing = PropertyListing.last
    assert_equal @first.id, listing.organization_id
    assert_equal @owner.id, listing.created_by_id
    assert listing.draft?
    assert_equal false, response.parsed_body.fetch("external_publication")
    assert_equal false, response.parsed_body.fetch("portal_feed_available")

    get "#{@url}/#{listing.id}", headers: auth(@owner)
    assert_response :success

    get "/api/v1/proximo/organizations/#{@second.id}/property_listings/#{listing.id}", headers: auth(@outsider)
    assert_response :not_found

    get @url, headers: auth(@member)
    assert_response :forbidden

    get @url
    assert_response :unauthorized
  end

  test "mandate and minimum data are required before a generic export" do
    post @url, params: { property_listing: valid_listing.except(:mandate_reference, :price_cents) }, headers: auth(@owner)
    assert_response :created
    id = response.parsed_body.fetch("id")

    get "#{@url}/#{id}/export", params: { kind: "json" }, headers: auth(@owner)
    assert_response :conflict

    patch "#{@url}/#{id}/prepare", headers: auth(@owner)
    assert_response :unprocessable_entity

    patch "#{@url}/#{id}", params: {
      property_listing: { mandate_reference: "MANDAT-DÉMO-01", price_cents: 25_000_000 }
    }, headers: auth(@owner)
    assert_response :success

    patch "#{@url}/#{id}/prepare", headers: auth(@owner)
    assert_response :success
    assert_equal "ready", response.parsed_body.fetch("status")

    get "#{@url}/#{id}/export", params: { kind: "json" }, headers: auth(@owner)
    assert_response :success
    assert_equal false, response.parsed_body.fetch("portal_compatible")
    assert_equal "not_submitted", response.parsed_body.fetch("destination_status")

    patch "#{@url}/#{id}", params: { property_listing: { title: "Tentative de réécriture" } }, headers: auth(@owner)
    assert_response :conflict
  end

  test "CSV export prevents spreadsheet formula injection" do
    post @url, params: { property_listing: valid_listing.merge(title: "=HYPERLINK(1)") }, headers: auth(@owner)
    assert_response :created
    id = response.parsed_body.fetch("id")
    patch "#{@url}/#{id}/prepare", headers: auth(@owner)
    assert_response :success

    get "#{@url}/#{id}/export", params: { kind: "csv" }, headers: auth(@owner)
    assert_response :success
    parsed = CSV.parse(response.body, headers: true)
    assert_equal "'=HYPERLINK(1)", parsed.first.fetch("title")
  end

  test "a regular member cannot prepare, export or read private listings" do
    post @url, params: { property_listing: valid_listing }, headers: auth(@owner)
    assert_response :created
    id = response.parsed_body.fetch("id")

    get "#{@url}/#{id}", headers: auth(@member)
    assert_response :forbidden
    patch "#{@url}/#{id}/prepare", headers: auth(@member)
    assert_response :forbidden
    get "#{@url}/#{id}/export", params: { kind: "json" }, headers: auth(@member)
    assert_response :forbidden
  end

  test "portal catalog exposes contracts and not fake API connections" do
    get "#{@url}/channels", headers: auth(@owner)
    assert_response :success
    assert response.parsed_body.any? { |channel| channel.fetch("id") == "seloger" && channel.fetch("mode") == "contract" }
    assert response.parsed_body.any? { |channel| channel.fetch("id") == "wordpress" && channel.fetch("mode") == "owner_blog" }
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end

  def valid_listing
    {
      title: "Appartement centre-ville", description: "Appartement lumineux au centre du bourg",
      city: "Bourg-Saint-Andéol", postal_code: "07700", property_kind: "appartement",
      transaction_type: "sale", price_cents: 25_000_000, area_sqm: 65.5,
      rooms: 3, bedrooms: 2, mandate_reference: "MANDAT-DÉMO-01",
      energy_class: "D", ghg_class: "B"
    }
  end
end
