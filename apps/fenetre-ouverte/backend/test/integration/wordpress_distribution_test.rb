require "test_helper"
require_relative "../support/scoped_class_method_stub"

class WordpressDistributionTest < ActionDispatch::IntegrationTest
  include ScopedClassMethodStub
  class VerifiedWordpress
    attr_reader :site_url

    def initialize
      @site_url = "https://commerce.fr"
    end

    def verify!
      { "id" => 7, "name" => "Éditeur" }
    end
  end

  setup do
    @agency = create_agency!(slug: "wp-#{SecureRandom.hex(5)}")
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
    @editor = create_user!(agency: @agency, role: :admin)
    @merchant_user = User.create!(
      email: "wp-merchant-#{SecureRandom.hex(5)}@demo.fr",
      password: "password123", role: :merchant, agency: @agency, merchant: @merchant
    )
    @url = "/api/v1/merchant/wordpress_connection"
  end

  test "merchant authorization is required before connecting a self-hosted blog" do
    get @url
    assert_response :unauthorized

    post @url, headers: auth(@merchant_user), params: {
      wordpress: { site_url: "https://commerce.fr", username: "éditeur",
                   application_password: "app-secret", authorized: false }
    }
    assert_response :unprocessable_entity
    assert_not @merchant.social_accounts.exists?(provider: :wordpress)
  end

  test "verified WordPress account is encrypted, private and disconnectable" do
    fake = VerifiedWordpress.new
    with_stubbed_class_method(Social::WordpressClient, :new, ->(**_args) { fake }) do
      post @url, headers: auth(@merchant_user), params: {
        wordpress: { site_url: "https://commerce.fr", username: "editor",
                     application_password: "dedicated-app-password", authorized: true }
      }
    end
    assert_response :created
    account = @merchant.social_accounts.find_by!(provider: :wordpress)
    assert_equal "https://commerce.fr", account.external_id
    assert_equal "editor", account.account_name
    assert_equal "dedicated-app-password", account.access_token
    assert account[:access_token].start_with?("enc:v1:")
    assert_not_includes response.body, "dedicated-app-password"

    get @url, headers: auth(@merchant_user)
    assert_response :success
    assert_equal true, response.parsed_body.fetch("connected")

    delete @url, headers: auth(@merchant_user)
    assert_response :no_content
    assert_nil @merchant.social_accounts.find_by(provider: :wordpress)
  end

  test "WordPress never publishes before editorial approval" do
    @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor", access_token: "app-secret",
      external_id: "https://commerce.fr", status: :connected
    )
    publication = @merchant.publications.create!(
      agency: @agency, status: :pending_review, category: :commerces,
      body: "Marché artisanal", requested_syndication: true,
      requested_providers: ["wordpress"]
    )
    assert publication.social_posts.empty?

    patch "/api/v1/admin/publication_moderations/#{publication.id}/approve", headers: auth(@editor)
    assert_response :success
    assert publication.reload.published?
    assert_equal ["wordpress"], publication.social_posts.pluck(:provider)
    assert publication.social_posts.first.pending?
    assert_equal false, publication.syndicated
  end

  test "a validated WordPress post is sent once and never repeated by a duplicate job" do
    @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor", access_token: "app-secret",
      external_id: "https://commerce.fr", status: :connected
    )
    publication = @merchant.publications.create!(
      agency: @agency, status: :published, category: :commerces,
      body: "Article déjà approuvé", requested_syndication: true,
      requested_providers: ["wordpress"]
    )
    post = publication.social_posts.create!(provider: :wordpress, status: :pending, destination_url: "https://commerce.fr")
    calls = 0
    publisher = ->(**_args) do
      calls += 1
      Social::Adapters::Base::Result.new(
        status: :published, external_post_id: "91", error_message: nil
      )
    end
    with_stubbed_class_method(Social::Adapters::Wordpress, :publish, publisher) do
      SocialPublishJob.perform_now(post.id)
      SocialPublishJob.perform_now(post.id)
    end
    assert_equal 1, calls
    assert post.reload.published?
    assert_equal "91", post.external_post_id
    assert publication.reload.syndicated?
  end

  test "WordPress article embeds only an escaped public HTTPS illustration" do
    account = @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor", access_token: "app-secret",
      external_id: "https://commerce.fr", status: :connected
    )
    fake = Object.new
    def fake.publish!(title:, html:, slug:)
      raise "expected safe image" unless html.include?('src="https://fo.example.fr/illustration.jpg?x=1&amp;y=2"')
      raise "unsafe img attribute" if html.include?('x=1&y=2')
      { "id" => 84, "status" => "publish", "link" => "https://commerce.fr/article" }
    end
    with_stubbed_class_method(Social::WordpressClient, :new, ->(**_args) { fake }) do
      result = Social::Adapters::Wordpress.publish(
        account: account, body: "Marché local", image_url: "https://fo.example.fr/illustration.jpg?x=1&y=2",
        delivery_slug: "fenetre-ouverte-1-1-1"
      )
      assert_equal :published, result.status
      assert_equal "https://commerce.fr/article", result.external_url
    end
  end

  test "HTML content is escaped before WordPress receives the post" do
    account = @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor", access_token: "app-secret",
      external_id: "https://commerce.fr", status: :connected
    )
    fake = Object.new
    def fake.publish!(title:, html:, slug:)
      raise "unsafe HTML" if html.include?("<script>")
      raise "missing escaped text" unless html.include?("&lt;script&gt;")
      { "id" => 83, "status" => "publish" }
    end
    with_stubbed_class_method(Social::WordpressClient, :new, ->(**_args) { fake }) do
      result = Social::Adapters::Wordpress.publish(
        account: account, body: "Marché <script>alert(1)</script>", image_url: nil, delivery_slug: "fenetre-ouverte-1-1-1"
      )
      assert_equal :published, result.status
      assert_equal "83", result.external_post_id
    end
  end

  test "manual verification retrieves a lost WordPress response without creating another article" do
    account = @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor",
      access_token: "app-secret", external_id: "https://commerce.fr",
      status: :connected
    )
    publication = @merchant.publications.create!(
      agency: @agency, status: :published, category: :commerces,
      body: "Marché artisanal"
    )
    post = publication.social_posts.create!(
      provider: :wordpress, status: :uncertain,
      destination_url: account.external_id, error_message: "Réponse perdue"
    )
    fake = Object.new
    def fake.find_published(slug:)
      { "id" => 145, "status" => "publish", "link" => "https://commerce.fr/mon-article" }
    end

    with_stubbed_class_method(Social::WordpressClient, :new, ->(**_args) { fake }) do
      post "/api/v1/merchant/social_posts/#{post.id}/verify_wordpress", headers: auth(@merchant_user)
    end
    assert_response :success
    assert_equal "published", response.parsed_body.fetch("status")
    assert_equal "https://commerce.fr/mon-article", post.reload.external_url
    assert_equal "145", post.external_post_id
    assert publication.reload.syndicated?
  end

  test "a merchant cannot verify another merchant's WordPress delivery" do
    other = create_merchant!(agency: @agency, sector: @sector)
    publication = other.publications.create!(
      agency: @agency, status: :published, category: :commerces, body: "Autre commerçant"
    )
    external = publication.social_posts.create!(
      provider: :wordpress, status: :uncertain, destination_url: "https://commerce.fr"
    )
    post "/api/v1/merchant/social_posts/#{external.id}/verify_wordpress",
      headers: auth(@merchant_user)
    assert_response :not_found
    assert external.reload.uncertain?
  end

  test "a changed blog cannot be used to confirm a previous delivery" do
    @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor",
      access_token: "app-secret", external_id: "https://autre-commerce.fr",
      status: :connected
    )
    publication = @merchant.publications.create!(
      agency: @agency, status: :published, category: :commerces, body: "Article"
    )
    external = publication.social_posts.create!(
      provider: :wordpress, status: :uncertain, destination_url: "https://commerce.fr"
    )
    post "/api/v1/merchant/social_posts/#{external.id}/verify_wordpress",
      headers: auth(@merchant_user)
    assert_response :conflict
    assert external.reload.uncertain?
  end

  test "an uncertain WordPress delivery is not re-sent by a repeated job" do
    account = @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor",
      access_token: "app-secret", external_id: "https://commerce.fr",
      status: :connected
    )
    publication = @merchant.publications.create!(
      agency: @agency, status: :published, category: :commerces, body: "Article"
    )
    external = publication.social_posts.create!(
      provider: :wordpress, status: :pending, destination_url: account.external_id
    )
    calls = 0
    uncertain = ->(**_args) do
      calls += 1
      Social::Adapters::Base::Result.new(status: :uncertain, external_post_id: nil,
                                         error_message: "Réponse inconnue")
    end
    with_stubbed_class_method(Social::Adapters::Wordpress, :publish, uncertain) do
      SocialPublishJob.perform_now(external.id)
      SocialPublishJob.perform_now(external.id)
    end
    assert_equal 1, calls
    assert external.reload.uncertain?
    assert_nil external.published_at
    assert_equal false, publication.reload.syndicated
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
