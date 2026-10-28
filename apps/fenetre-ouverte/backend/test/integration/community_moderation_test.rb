require "test_helper"

class CommunityModerationTest < ActionDispatch::IntegrationTest
  setup do
    @first = create_agency!(slug: "moderation-#{SecureRandom.hex(5)}")
    @other = create_agency!(slug: "other-#{SecureRandom.hex(5)}")
    @sector = create_sector!(agency: @first)
    @merchant = create_merchant!(agency: @first, sector: @sector)
    @admin = create_user!(agency: @first, role: :admin)
    @other_admin = create_user!(agency: @other, role: :admin)
    @merchant_user = User.create!(
      email: "boutique-#{SecureRandom.hex(5)}@demo.fr", password: "password123",
      role: :merchant, agency: @first, merchant: @merchant
    )
  end

  test "merchant publication requires approval before showing in public feed" do
    post "/api/v1/merchant/publications", headers: auth(@merchant_user),
         params: { publication: { body: "Nouveautes de saison", category: "commerces" } }
    assert_response :created
    publication = @merchant.publications.order(:id).last
    assert_equal "pending_review", publication.status
    assert_nil publication.published_at

    get "/api/v1/public/publications/#{publication.id}"
    assert_response :not_found

    get "/api/v1/admin/publication_moderations", headers: auth(@admin)
    assert_response :success
    assert_includes response.parsed_body.map { |row| row.fetch("id") }, publication.id

    patch "/api/v1/admin/publication_moderations/#{publication.id}/approve", headers: auth(@admin)
    assert_response :success
    assert_equal "published", publication.reload.status

    get "/api/v1/public/publications/#{publication.id}"
    assert_response :success
  end

  test "rejected publications stay private; cross-agency moderation is forbidden" do
    publication = @merchant.publications.create!(
      agency: @first, status: :pending_review, body: "Post a controler", category: :commerces
    )
    patch "/api/v1/admin/publication_moderations/#{publication.id}/approve", headers: auth(@other_admin)
    assert_response :not_found
    patch "/api/v1/admin/publication_moderations/#{publication.id}/reject",
          params: { reason: "Hors charte" }, headers: auth(@admin)
    assert_response :success
    assert_equal "rejected", publication.reload.status
    assert_equal "Hors charte", publication.review_note
  end

  test "merchant profile changes are staged until admin approval" do
    original = @merchant.short_description
    patch "/api/v1/merchant/profile", headers: auth(@merchant_user),
      params: { merchant: { short_description: "Nouveaux horaires annonces" } }
    assert_response :accepted
    assert_nil @merchant.reload.short_description
    revision = @merchant.merchant_profile_revisions.pending_review.last
    assert_equal "Nouveaux horaires annonces", revision.changeset.fetch("short_description")

    patch "/api/v1/admin/profile_reviews/#{revision.id}/approve", headers: auth(@other_admin)
    assert_response :not_found
    patch "/api/v1/admin/profile_reviews/#{revision.id}/approve", headers: auth(@admin)
    assert_response :success
    assert_equal "approved", revision.reload.status
    assert_equal "Nouveaux horaires annonces", @merchant.reload.short_description
  end

  test "admin rejects proposed profile changes without changing public merchant" do
    patch "/api/v1/merchant/profile", headers: auth(@merchant_user),
      params: { merchant: { description: "Texte a refuser" } }
    assert_response :accepted
    revision = @merchant.merchant_profile_revisions.pending_review.last
    patch "/api/v1/admin/profile_reviews/#{revision.id}/reject", headers: auth(@admin),
      params: { reason: "Photo non conformee" }
    assert_response :success
    assert_equal "rejected", revision.reload.status
    assert_not_equal "Texte a refuser", @merchant.reload.description
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
