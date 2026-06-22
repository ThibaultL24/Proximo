# app/serializers/article_serializer.rb
class ArticleSerializer < AlbaResource
  attributes :id, :title, :slug, :excerpt, :body, :category, :status, :published_at

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
