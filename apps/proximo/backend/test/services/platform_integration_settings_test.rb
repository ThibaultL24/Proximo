# test/services/platform_integration_settings_test.rb
require "test_helper"

class PlatformIntegrationSettingsTest < ActiveSupport::TestCase
  setup do
    PlatformIntegration.delete_all
    @original_meta_id = ENV["META_APP_ID"]
    @original_meta_secret = ENV["META_APP_SECRET"]
    ENV.delete("META_APP_ID")
    ENV.delete("META_APP_SECRET")
  end

  teardown do
    ENV["META_APP_ID"] = @original_meta_id
    ENV["META_APP_SECRET"] = @original_meta_secret
  end

  test "stores secrets encrypted and resolves configured meta" do
    PlatformIntegrationSettings.update!(
      meta_app_id: "meta-app-123",
      meta_app_secret: "meta-secret-456"
    )

    assert Social::Config.meta_configured?
    assert_equal "meta-app-123", PlatformIntegrationSettings.meta_app_id
    assert_equal "meta-secret-456", PlatformIntegrationSettings.meta_app_secret
    assert_equal "database", PlatformIntegrationSettings.meta_secret_source

    record = PlatformIntegration.instance
    assert record.meta_app_secret_ciphertext.present?
    assert_not_includes record.meta_app_secret_ciphertext, "meta-secret-456"
  end

  test "keeps existing secret when update omits secret field" do
    PlatformIntegrationSettings.update!(meta_app_id: "app", meta_app_secret: "secret-one")
    PlatformIntegrationSettings.update!(meta_app_id: "app-updated")

    assert_equal "secret-one", PlatformIntegrationSettings.meta_app_secret
    assert_equal "app-updated", PlatformIntegrationSettings.meta_app_id
  end

  test "falls back to env when database empty" do
    ENV["META_APP_ID"] = "env-app"
    ENV["META_APP_SECRET"] = "env-secret"

    assert Social::Config.meta_configured?
    assert_equal "env", PlatformIntegrationSettings.meta_secret_source
  end
end
