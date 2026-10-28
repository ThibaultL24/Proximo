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

    unless Social::Config.v1_provider?(social_post.provider)
      social_post.update!(status: :skipped, error_message: "Réseau non supporté en V1")
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
      image_content_type: image&.dig(:content_type)
    )

    social_post.update!(
      status: result.status,
      external_post_id: result.external_post_id,
      published_at: result.status.to_sym == :published ? Time.current : nil,
      error_message: result.error_message
    )

    if account.demo? || !Social::Config.configured?(account.provider)
      Rails.logger.info("[SocialPublisher] Demo/live-fallback #{social_post.provider}: #{body.to_s.truncate(80)}")
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
