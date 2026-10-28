# app/serializers/merchant_detail_serializer.rb
class MerchantDetailSerializer < MerchantSerializer
  attribute :articles do |merchant|
    merchant.articles.published.order(published_at: :desc).map do |article|
      {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        category: article.category,
        published_at: article.published_at
      }
    end
  end
end
