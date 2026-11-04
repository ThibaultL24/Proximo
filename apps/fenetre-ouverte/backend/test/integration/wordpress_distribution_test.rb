require "test_helper"

class WordpressDistributionTest < ActionDispatch::IntegrationTest
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
    Social::WordpressClient.stub(:new, fake) do
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

  test "HTML content is escaped before WordPress receives the post" do
    account = @merchant.social_accounts.create!(
      provider: :wordpress, account_name: "editor", access_token: "app-secret",
      external_id: "https://commerce.fr", status: :connected
    )
    fake = Object.new
    def fake.publish!(title:, html:)
      raise "unsafe HTML" if html.include?("<script>")
      raise "missing escaped text" unless html.include?("&lt;script&gt;")
      { "id" => 83, "status" => "publish" }
    end
    Social::WordpressClient.stub(:new, fake) do
      result = Social::Adapters::Wordpress.publish(
        account: account, body: "Marché <script>alert(1)</script>", image_url: nil
      )
      assert_equal :published, result.status
      assert_equal "83", result.external_post_id
    end
  end

  private

  def auth(user)
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
  end
end
