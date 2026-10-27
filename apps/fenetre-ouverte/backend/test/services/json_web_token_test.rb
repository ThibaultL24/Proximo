require "test_helper"

class JsonWebTokenTest < ActiveSupport::TestCase
  test "creates and verifies a local token with explicit issuer and audience" do
    token = JsonWebToken.encode(user_id: 42)
    payload = JsonWebToken.decode(token)

    assert_equal 42, payload[:user_id]
    assert_equal JsonWebToken::ISSUER, payload[:iss]
    assert_equal JsonWebToken::AUDIENCE, payload[:aud]
  end

  test "rejects a token issued for the other application even with our signing key" do
    other_issuer = "proximo"
    token = JWT.encode({ user_id: 42, exp: 1.hour.from_now.to_i,
      iss: other_issuer, aud: "#{other_issuer}-api" }, JsonWebToken::SECRET, "HS256")

    assert_nil JsonWebToken.decode(token)
  end

  test "rejects wrong audience" do
    token = JWT.encode({ user_id: 42, exp: 1.hour.from_now.to_i,
      iss: JsonWebToken::ISSUER, aud: "another-api" }, JsonWebToken::SECRET, "HS256")

    assert_nil JsonWebToken.decode(token)
  end

  test "rejects an expired token" do
    assert_nil JsonWebToken.decode(JsonWebToken.encode({ user_id: 42 }, exp: 1.minute.ago))
  end

  test "rejects an unsigned or invalid token" do
    assert_nil JsonWebToken.decode("this-is-not-a-jwt")
  end
end
