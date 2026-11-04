# test/services/social_tiktok_oauth_test.rb
require "test_helper"

class SocialTiktokOauthTest < ActiveSupport::TestCase
  setup do
    PlatformIntegration.delete_all
    @original_key = ENV["TIKTOK_CLIENT_KEY"]
    @original_secret = ENV["TIKTOK_CLIENT_SECRET"]
    ENV.delete("TIKTOK_CLIENT_KEY")
    ENV.delete("TIKTOK_CLIENT_SECRET")
  end

  teardown do
    ENV["TIKTOK_CLIENT_KEY"] = @original_key
    ENV["TIKTOK_CLIENT_SECRET"] = @original_secret
  end

  test "authorize url uses stored tiktok credentials" do
    PlatformIntegrationSettings.update!(
      tiktok_client_key: "tt-key",
      tiktok_client_secret: "tt-secret"
    )

    assert Social::Config.tiktok_configured?
    url = Social::Oauth.authorize_url("tiktok", "signed-state")
    assert_includes url, "https://www.tiktok.com/v2/auth/authorize/"
    assert_includes url, "client_key=tt-key"
    assert_includes url, "state=tiktok%3Asigned-state"
    assert_includes url, "video.publish"
  end

  test "live adapter fails without public https image" do
    agency = create_agency!
    sector = create_sector!(agency: agency)
    merchant = create_merchant!(agency: agency, sector: sector)
    account = merchant.social_accounts.create!(
      provider: :tiktok,
      account_name: "Martin TikTok",
      access_token: "live-token",
      status: :connected,
      connected_at: Time.current
    )
    PlatformIntegrationSettings.update!(
      tiktok_client_key: "tt-key",
      tiktok_client_secret: "tt-secret"
    )

    result = Social::Adapters::Tiktok.publish(account: account, body: "Fouace du samedi")
    assert_equal :failed, result.status
    assert_match(/HTTPS/i, result.error_message)
  end
end
