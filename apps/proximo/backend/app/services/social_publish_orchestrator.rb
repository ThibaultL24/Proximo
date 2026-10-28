# app/services/social_publish_orchestrator.rb
class SocialPublishOrchestrator
  def self.call(publication:, providers: nil)
    new(publication:, providers:).call
  end

  def initialize(publication:, providers: nil)
    @publication = publication
    @providers = Array(providers).compact_blank.map(&:to_s)
  end

  def call
    accounts = publication.merchant.social_accounts.ready
    accounts = accounts.where(provider: providers) if providers.any?

    if accounts.empty?
      publication.update!(syndicated: false)
      return []
    end

    posts = accounts.map do |account|
      post = publication.social_posts.find_or_initialize_by(provider: account.provider)
      post.status = :pending
      post.error_message = nil
      post.save!
      SocialPublisher.call(post)
      post.reload
    end

    publication.update!(syndicated: posts.any? { |post| post.published? })
    posts
  end

  private

  attr_reader :publication, :providers
end
