# app/serializers/article_serializer.rb
class ArticleSerializer < AlbaResource
  include AttachmentUrls

  attributes :id, :title, :slug, :excerpt, :body, :category, :status, :published_at

  attribute :cover_image_url do |article|
    blob_path(article.cover_image)
  end

  attribute :place do |article|
    territory = article.place || article.merchant&.place
    next unless territory

    PlaceSerializer.new(territory).serializable_hash
  end

  attribute :gazette_label do |article|
    territory = article.place || article.merchant&.place
    GazetteLabel.for(territory)
  end

  attribute :territory_label do |article|
    territory = article.place || article.merchant&.place
    GazetteLabel.territory_label(territory)
  end
end
