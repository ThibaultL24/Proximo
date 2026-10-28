# app/services/publication_creator.rb
class PublicationCreator
  def self.call(merchant:, params:, syndicate: false, providers: nil)
    new(merchant:, params:, syndicate:, providers:).call
  end

  def initialize(merchant:, params:, syndicate: false, providers: nil)
    @merchant = merchant
    @params = params
    @syndicate = syndicate
    @providers = providers
  end

  def call
    publication = merchant.publications.build(params.except(:image))
    publication.agency = merchant.agency
    publication.category ||= merchant.partner_category
    publication.image.attach(params[:image]) if params[:image].present?
    publication.save!

    publication.publish!

    if syndicate && merchant.subscription_active?
      selected = resolve_providers(providers)
      SocialPublishOrchestrator.call(publication:, providers: selected) if selected.any?
    end

    publication.reload
  end

  private

  attr_reader :merchant, :params, :syndicate, :providers

  def resolve_providers(explicit)
    allowed = Social::Config::V1_PROVIDERS.select { |provider| merchant.social_page_configured?(provider) }
    explicit_list = Array(explicit).compact_blank.map(&:to_s)

    if explicit_list.any?
      explicit_list & allowed
    else
      merchant.social_accounts.ready.where(provider: allowed).pluck(:provider)
    end
  end
end
