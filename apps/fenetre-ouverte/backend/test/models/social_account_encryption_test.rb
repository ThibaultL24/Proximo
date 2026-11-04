require "test_helper"

class SocialAccountEncryptionTest < ActiveSupport::TestCase
  setup do
    agency = create_agency!(slug: "social-secret-#{SecureRandom.hex(4)}")
    sector = create_sector!(agency: agency)
    @merchant = create_merchant!(agency: agency, sector: sector)
  end

  test "new tokens are encrypted at rest while remaining usable by adapters" do
    account = @merchant.social_accounts.create!(
      provider: :facebook, account_name: "Page test",
      status: :connected, access_token: "secret-access-token",
      refresh_token: "secret-refresh-token"
    )
    assert account[:access_token].start_with?("enc:v1:")
    assert account[:refresh_token].start_with?("enc:v1:")
    assert_not_includes account[:access_token], "secret-access-token"
    assert_equal "secret-access-token", account.reload.access_token
    assert_equal "secret-refresh-token", account.refresh_token
  end

  test "legacy plaintext tokens can be reencrypted idempotently without losing accounts" do
    account = @merchant.social_accounts.create!(
      provider: :instagram, account_name: "Compte historique", status: :connected,
      access_token: "initial"
    )
    account.update_columns(access_token: "plaintext-legacy")
    assert_equal "plaintext-legacy", account.reload.access_token
    account.encrypt_legacy_token_fields
    account.save!(validate: false)
    stored = account[:access_token]

    assert stored.start_with?("enc:v1:")
    assert_equal "plaintext-legacy", account.reload.access_token
    account.encrypt_legacy_token_fields
    account.save!(validate: false)
    assert_equal stored, account.reload[:access_token]
  end

  test "demo token remains clearly identified, even encrypted at rest" do
    account = @merchant.social_accounts.create!(
      provider: :tiktok, account_name: "Démo", status: :connected, access_token: "demo"
    )
    assert account.demo?
    assert_not_equal "demo", account[:access_token]
  end
end
