# app/services/social_publisher.rb
class SocialPublisher
  def self.call(social_post)
    new(social_post).call
  end

  def initialize(social_post)
    @social_post = social_post
  end

  def call
    account = social_post.publication.merchant.social_accounts.find_by(provider: social_post.provider)
    unless account&.connected?
      social_post.update!(status: :skipped, error_message: "Compte non connecté")
      return :skipped
    end

    if account.demo? || account.access_token.blank? || !Social::Config.configured?(account.provider)
      social_post.update!(
        status: :skipped, external_post_id: nil, published_at: nil,
        error_message: "Mode démo ou autorisation API absente : aucune diffusion réelle"
      )
      return :skipped
    end

    unless Social::Config.deliverable_provider?(social_post.provider)
      social_post.update!(status: :skipped, error_message: "Réseau non supporté en V1")
      return :skipped
    end

    if social_post.wordpress? && social_post.destination_url != account.external_id
      social_post.update!(status: :skipped, error_message: "La connexion WordPress a changé depuis la validation")
      return :skipped
    end

    signed_body = SocialSignature.call(publication: social_post.publication)
    body = truncate(signed_body, social_post.provider)
    image = attached_image

    if %w[instagram tiktok].include?(social_post.provider) && image.nil? && !account.demo? && Social::Config.configured?(social_post.provider)
      network = social_post.provider == "tiktok" ? "TikTok" : "Instagram"
      social_post.update!(status: :skipped, error_message: "#{network} requiert une photo")
      return :skipped
    end

    result = Social::Adapters.for(social_post.provider).publish(
      account: account,
      body: body,
      image_url: absolute_image_url,
      image_io: image && StringIO.new(image[:bytes]),
      image_filename: image&.dig(:filename),
      image_content_type: image&.dig(:content_type),
      delivery_slug: social_post.wordpress? ? social_post.wordpress_delivery_slug : nil
    )

    social_post.update!(
      status: result.status,
      external_post_id: result.external_post_id,
      external_url: result.external_url,
      published_at: result.status.to_sym == :published ? Time.current : nil,
      error_message: result.error_message
    )

    if result.status.to_sym == :published
      social_post.publication.update!(syndicated: true)
    end

    result.status
  rescue StandardError => e
    social_post.update!(status: :failed, error_message: e.message)
    :failed
  end

  private

  attr_reader :social_post

  def truncate(text, provider)
    limit = Social::Config.char_limit(provider)
    trimmed = text.to_s.strip
    return trimmed if trimmed.length <= limit

    "#{trimmed[0, limit - 1]}…"
  end

  def absolute_image_url
    publication = social_post.publication
    return nil unless publication.image.attached?

    path = AttachmentUrls.blob_path(publication.image)
    return nil if path.blank?
    return path if path.start_with?("http")

    "#{Social::Config.backend_url}#{path}"
  end

  def attached_image
    publication = social_post.publication
    return nil unless publication.image.attached?

    blob = publication.image.blob
    {
      bytes: blob.download,
      filename: blob.filename.to_s,
      content_type: blob.content_type
    }
  end
end
