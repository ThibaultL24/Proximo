# app/serializers/product_serializer.rb
class ProductSerializer < AlbaResource
  include AttachmentUrls
  attributes :id, :name, :slug, :description, :price_cents, :currency, :checkout_mode, :status, :image_url

  attribute :seller_type do |product|
    product.agency_product? ? "agency" : "merchant"
  end

  attribute :platform_fee_cents, &:platform_fee_cents
  attribute :merchant_amount_cents, &:merchant_amount_cents

  attribute :merchant do |product|
    next unless product.merchant

    {
      id: product.merchant.id,
      name: product.merchant.name,
      slug: product.merchant.slug,
      logo_url: AttachmentUrls.blob_path(product.merchant.logo),
      stripe_ready: product.merchant.stripe_onboarding_completed && product.merchant.stripe_account_id.present?
    }
  end

  attribute :checkout_label do |product|
    {
      "one_time" => "Paiement unique",
      "promo" => "Paiement unique + code promo",
      "installment" => "Paiement en plusieurs fois"
    }.fetch(product.checkout_mode, product.checkout_mode)
  end
end
