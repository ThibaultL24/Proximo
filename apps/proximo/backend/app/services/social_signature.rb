# app/services/social_signature.rb
class SocialSignature
  SUFFIX = "— via Fenêtre Ouverte · 07700".freeze

  def self.call(publication:)
    new(publication).call
  end

  def initialize(publication)
    @publication = publication
  end

  def call
    body = publication.body.to_s.strip
    signature = [SUFFIX, public_merchant_link].compact.join("\n")
    return signature if body.blank?
    return body if body.include?("Fenêtre Ouverte · 07700")

    "#{body}\n\n#{signature}"
  end

  private

  attr_reader :publication

  # N'ajoute le lien fiche que s'il est publiquement accessible (pas localhost)
  def public_merchant_link
    merchant = publication.merchant
    return nil unless merchant

    base = ENV.fetch("FRONTEND_URL", "http://localhost:5173").to_s.chomp("/")
    return nil if base.include?("localhost") || base.include?("127.0.0.1")
    return nil unless base.start_with?("https://")

    "#{base}/commercants/#{merchant.slug}"
  end
end
