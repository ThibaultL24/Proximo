# app/services/json_web_token.rb
class JsonWebToken
  SECRET = Rails.application.credentials.secret_key_base

  def self.encode(payload = {}, exp: 24.hours.from_now)
    data = payload.is_a?(Hash) ? payload.dup : { user_id: payload }
    data[:exp] = exp.to_i
    JWT.encode(data, SECRET, "HS256")
  end

  def self.decode(token)
    body = JWT.decode(token, SECRET, true, { algorithm: "HS256" }).first
    ActiveSupport::HashWithIndifferentAccess.new(body)
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
