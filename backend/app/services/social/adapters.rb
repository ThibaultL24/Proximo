# app/services/social/adapters.rb
module Social
  module Adapters
    module_function

    MAP = {
      "facebook" => Facebook,
      "instagram" => Instagram,
      "tiktok" => Tiktok
    }.freeze

    def for(provider)
      MAP.fetch(provider.to_s) { raise ArgumentError, "Adapter inconnu: #{provider}" }
    end
  end
end
