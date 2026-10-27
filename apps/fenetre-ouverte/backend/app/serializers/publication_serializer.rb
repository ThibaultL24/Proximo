# app/serializers/publication_serializer.rb
class PublicationSerializer < AlbaResource
  include AttachmentUrls

  attributes :id, :body, :category, :status, :published_at, :syndicated, :created_at

  attribute :image_url do |publication|
    blob_path(publication.image)
  end

  attribute :merchant do |publication|
    {
      id: publication.merchant.id,
      name: publication.merchant.name,
      slug: publication.merchant.slug,
      partner_category: publication.merchant.partner_category
    }
  end

  attribute :social_posts do |publication|
    publication.social_posts.map do |post|
      {
        id: post.id,
        provider: post.provider,
        status: post.status,
        external_post_id: post.external_post_id,
        error_message: post.error_message,
        published_at: post.published_at
      }
    end
  end
end
