# app/serializers/admin_article_serializer.rb
class AdminArticleSerializer < AlbaResource
  attributes :id, :title, :slug, :excerpt, :body, :category, :status,
             :published_at, :author_id, :merchant_id, :created_at, :updated_at

  attribute :author do |article|
    user = article.author
    {
      id: user.id,
      full_name: user.full_name.presence || user.email,
      email: user.email
    }
  end

  attribute :merchant do |article|
    next nil unless article.merchant

    {
      id: article.merchant.id,
      name: article.merchant.name,
      slug: article.merchant.slug
    }
  end

  attribute :place do |article|
    next unless article.place

    PlaceSerializer.new(article.place).serializable_hash
  end

  attribute :place_id do |article|
    article.place_id
  end
end
