# Jetons strictement propres à proximo : un token de l'autre application n'est jamais valide.
class JsonWebToken
  ISSUER = "proximo"
  AUDIENCE = "proximo-api"
  SECRET = ENV.fetch("PROXIMO_JWT_SECRET") do
    raise "PROXIMO_JWT_SECRET manquant en production" if Rails.env.production?

    "development-test-only-proximo-jwt-secret"
  end

  def self.encode(payload = {}, exp: 24.hours.from_now)
    data = payload.is_a?(Hash) ? payload.dup : { user_id: payload }
    data[:exp] = exp.to_i
    data[:iss] = ISSUER
    data[:aud] = AUDIENCE
    JWT.encode(data, SECRET, "HS256")
  end

  def self.decode(token)
    body = JWT.decode(token, SECRET, true, algorithm: "HS256",
      verify_iss: true, iss: ISSUER,
      verify_aud: true, aud: AUDIENCE).first
    ActiveSupport::HashWithIndifferentAccess.new(body)
  rescue JWT::DecodeError
    nil
  end
end
