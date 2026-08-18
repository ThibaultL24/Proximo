# test/services/platform_secrets_test.rb
require "test_helper"

class PlatformSecretsTest < ActiveSupport::TestCase
  test "encrypts and decrypts values" do
    ciphertext = PlatformSecrets.encrypt("super-secret")
    assert_not_equal "super-secret", ciphertext
    assert_equal "super-secret", PlatformSecrets.decrypt(ciphertext)
  end

  test "returns nil for blank values" do
    assert_nil PlatformSecrets.encrypt("")
    assert_nil PlatformSecrets.decrypt("")
  end
end
