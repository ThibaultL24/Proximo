# app/serializers/admin_merchant_serializer.rb
class AdminMerchantSerializer < AlbaResource
  attributes :id, :name, :slug, :short_description, :description,
             :address, :postal_code, :city, :phone, :email, :website,
             :featured, :status, :sector_id, :place_id, :qr_token, :qr_scan_count, :created_at, :updated_at

  attribute :qr_url do |merchant|
    merchant.qr_url
  end

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
