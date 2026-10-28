# Commerce publications must be approved before public visibility or syndication.
class PublicationCreator
  def self.call(merchant:, params:, syndicate: false, providers: nil)
    publication = merchant.publications.build(params.except(:image))
    publication.agency = merchant.agency
    publication.territory = merchant.territory
    publication.category ||= merchant.partner_category
    publication.status = :pending_review
    publication.requested_syndication = ActiveModel::Type::Boolean.new.cast(syndicate) == true
    publication.requested_providers = Array(providers).compact_blank.map(&:to_s).uniq &
                                      Social::Config::V1_PROVIDERS
    publication.image.attach(params[:image]) if params[:image].present?
    publication.save!
    publication
  end
end
