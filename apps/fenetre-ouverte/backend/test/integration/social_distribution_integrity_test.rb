require "test_helper"

class SocialDistributionIntegrityTest < ActionDispatch::IntegrationTest
  setup do
    @agency = create_agency!(slug: "social-#{SecureRandom.hex(5)}")
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
    @editor = create_user!(agency: @agency, role: :admin)
    @merchant_user = User.create!(
      email: "merchant-#{SecureRandom.hex(5)}@demo.fr",
      password: "password123", role: :merchant,
      agency: @agency, merchant: @merchant
    )
  end

  test "catalog makes planned and paid channels explicit to merchant only" do
    get "/api/v1/merchant/social_channels", headers: auth(@merchant_user)
    assert_response :success
    entries = response.parsed_body
    assert entries.any? { |row| row.fetch("id") == "wordpress" && row.fetch("mode") == "partner" }
    assert entries.any? { |row| row.fetch("id") == "x" && row.fetch("mode") == "paid" }
    assert entries.any? { |row| row.fetch("id") == "facebook" && !row.fetch("connected_live") }

    get "/api/v1/merchant/social_channels"
    assert_response :unauthorized
  end

  test "demo credentials never create a published social post" do
    @merchant.social_accounts.create!(
      provider: :facebook, account_name: "Compte test",
      status: :connected, access_token: "demo", external_id: "demo-facebook"
    )
    publication = @merchant.publications.create!(
      agency: @agency, body: "Nouveauté de saison", category: :commerces, status: :published
    )
    external = publication.social_posts.create!(provider: :facebook, status: :pending)
    result = SocialPublisher.call(external)
    assert_equal :skipped, result
    assert external.reload.skipped?
    assert_nil external.published_at
    assert_nil external.external_post_id
    assert_equal false, publication.reload.syndicated
    assert_match(/aucune diffusion réelle/i, external.error_message)
  end

  test "publication moderation queues social delivery without claiming success" do
    @merchant.social_accounts.create!(
      provider: :facebook, account_name: "Page de démonstration",
      status: :connected, access_token: "demo", external_id: "demo-facebook"
    )
    publication = @merchant.publications.create!(
      agency: @agency, body: "Marché ce samedi", category: :commerces,
      status: :pending_review, requested_syndication: true, requested_providers: ["facebook"]
    )
    patch "/api/v1/admin/publication_moderations/#{publication.id}/approve", headers: auth(@editor)
    assert_response :success
    assert publication.reload.published?
    assert_equal false, publication.syndicated
    assert_equal 1, publication.social_posts.count
    assert publication.social_posts.first.pending?
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
