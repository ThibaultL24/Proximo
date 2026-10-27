require "test_helper"
require Rails.root.join("db/migrate/20261028000200_backfill_territories").to_s

class TerritoryIsolationTest < ActionDispatch::IntegrationTest
  setup do
    @agency_a = create_agency!(slug: "ard-#{SecureRandom.hex(4)}")
    @agency_b = create_agency!(slug: "rhone-#{SecureRandom.hex(4)}")
    @sector_a = create_sector!(agency: @agency_a)
    @sector_b = create_sector!(agency: @agency_b)
    @merchant_a = create_merchant!(agency: @agency_a, sector: @sector_a)
    @merchant_b = create_merchant!(agency: @agency_b, sector: @sector_b)
    @editor_a = create_user!(agency: @agency_a, role: :admin)
    @editor_b = create_user!(agency: @agency_b, role: :admin)

    @article_a = Article.create!(agency: @agency_a, author: @editor_a, title: "Article A",
      slug: "article-a", body: "Texte A", category: :local_news, status: :published,
      published_at: Time.current)
    @article_b = Article.create!(agency: @agency_b, author: @editor_b, title: "Article B",
      slug: "article-b", body: "Texte B", category: :local_news, status: :published,
      published_at: Time.current)
    @draft_b = Article.create!(agency: @agency_b, author: @editor_b, title: "Brouillon B",
      slug: "brouillon-b", body: "Prive", category: :local_news, status: :draft)
    @draft_a = Article.create!(agency: @agency_a, author: @editor_a, title: "Brouillon A",
      slug: "brouillon-a", body: "Prive", category: :local_news, status: :draft)
    @pub_a = Publication.create!(agency: @agency_a, merchant: @merchant_a,
      body: "Publication A", category: :commerces, status: :published, published_at: Time.current)
    @pub_b = Publication.create!(agency: @agency_b, merchant: @merchant_b,
      body: "Publication B", category: :commerces, status: :published, published_at: Time.current)

    BackfillTerritories.new.backfill!
    @territory_a = Territory.find_by!(legacy_agency_id: @agency_a.id)
    @territory_b = Territory.find_by!(legacy_agency_id: @agency_b.id)
    @base_a = "/api/v1/territories/#{@territory_a.slug}"
    @base_b = "/api/v1/territories/#{@territory_b.slug}"
  end

  test "backfill safely maps all legacy content and editors without duplicating" do
    assert_equal @territory_a.id, @sector_a.reload.territory_id
    assert_equal @territory_a.id, @merchant_a.reload.territory_id
    assert_equal @territory_a.id, @article_a.reload.territory_id
    assert_equal @territory_a.id, @pub_a.reload.territory_id
    assert_equal "owner", TerritoryMembership.find_by!(territory: @territory_a, user: @editor_a).role
    BackfillTerritories.new.backfill!
    assert_equal 1, Territory.where(legacy_agency_id: @agency_a.id).count
    assert_equal 1, TerritoryMembership.where(territory: @territory_a, user: @editor_a).count
  end

  test "published merchants and articles are strictly filtered by territory" do
    get "#{@base_a}/merchants"
    assert_response :success
    assert_equal [@merchant_a.id], response.parsed_body.map { |m| m.fetch("id") }

    get "#{@base_a}/merchants/#{@merchant_b.slug}"
    assert_response :not_found

    get "#{@base_a}/articles"
    assert_response :success
    assert_equal [@article_a.id], response.parsed_body.map { |a| a.fetch("id") }

    get "#{@base_a}/articles/#{@article_b.slug}"
    assert_response :not_found
    get "#{@base_a}/articles/#{@draft_a.slug}"
    assert_response :not_found
  end

  test "publications are tenant scoped even when guessed by ID" do
    get "#{@base_a}/publications"
    assert_response :success
    assert_equal [@pub_a.id], response.parsed_body.map { |p| p.fetch("id") }

    get "#{@base_a}/publications/#{@pub_b.id}"
    assert_response :not_found
  end

  test "editor can update their own draft, but cannot modify a foreign territory draft" do
    patch "#{@base_a}/articles/#{@draft_a.id}",
      params: { article: { body: "Nouvelle version", territory_id: @territory_b.id, status: "published" } },
      headers: auth(@editor_a)
    assert_response :success
    assert_equal "Nouvelle version", @draft_a.reload.body
    assert_equal @territory_a.id, @draft_a.territory_id
    assert_equal "draft", @draft_a.status

    patch "#{@base_a}/articles/#{@draft_b.id}",
      params: { article: { body: "Intrusion" } }, headers: auth(@editor_a)
    assert_response :not_found
    assert_equal "Prive", @draft_b.reload.body
  end

  test "editor of a different territory cannot modify an article" do
    patch "#{@base_a}/articles/#{@draft_a.id}",
      params: { article: { body: "Intrusion" } }, headers: auth(@editor_b)
    assert_response :forbidden
  end

  test "no authentication cannot modify a draft" do
    patch "#{@base_a}/articles/#{@draft_a.id}", params: { article: { body: "Intrusion" } }
    assert_response :unauthorized
  end

  test "published editorial articles cannot bypass review and be edited" do
    patch "#{@base_a}/articles/#{@article_a.id}",
      params: { article: { body: "Intrusion" } }, headers: auth(@editor_a)
    assert_response :unprocessable_entity
    assert_equal "Texte A", @article_a.reload.body
  end

  test "model validation blocks cross-territory references" do
    assert_not @pub_a.update(territory: @territory_b)
    assert_not @merchant_a.update(territory: @territory_b)
    assert_not @article_a.update(territory: @territory_b)
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
