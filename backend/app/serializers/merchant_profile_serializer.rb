# app/serializers/merchant_profile_serializer.rb
class MerchantProfileSerializer < MerchantSerializer
  attributes :qr_token, :qr_scan_count

  attribute :qr_url do |merchant|
    merchant.qr_url
  end

  attribute :public_url do |merchant|
    "/commercants/#{merchant.slug}"
  end

  attribute :logo do |merchant|
    next unless merchant.logo.attached?

    blob = merchant.logo
    {
      signed_id: blob.signed_id,
      url: AttachmentUrls.blob_path(blob)
    }
  end

  attribute :photos do |merchant|
    merchant.photos.map do |photo|
      {
        signed_id: photo.signed_id,
        url: AttachmentUrls.blob_path(photo)
      }
    end
  end

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
