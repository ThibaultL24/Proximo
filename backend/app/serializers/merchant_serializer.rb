# app/serializers/merchant_serializer.rb
class MerchantSerializer < AlbaResource
  attributes :id, :name, :slug, :short_description, :description,
             :address, :postal_code, :city, :phone, :email, :website,
             :opening_hours, :featured, :status

  attribute :sector do |merchant|
    SectorSerializer.new(merchant.sector).serializable_hash
  end

  attribute :place do |merchant|
    next unless merchant.place

    PlaceSerializer.new(merchant.place).serializable_hash
  end

  attribute :logo_url do |merchant|
    AttachmentUrls.blob_path(merchant.logo)
  end

  attribute :photo_urls do |merchant|
    AttachmentUrls.blob_paths(merchant.photos)
  end
end
