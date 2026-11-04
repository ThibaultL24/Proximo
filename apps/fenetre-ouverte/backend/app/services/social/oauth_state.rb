# app/services/social/oauth_state.rb
module Social
  module OauthState
    module_function

    def generate(merchant_id:, provider:)
      verifier.generate({ "merchant_id" => merchant_id, "provider" => provider.to_s, "exp" => 30.minutes.from_now.to_i })
    end

    def verify(state)
      data = verifier.verify(state)
      return nil if data["exp"].to_i < Time.current.to_i

      data
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      nil
    end

    def verifier
      Rails.application.message_verifier("social_oauth")
    end
  end
end
