# app/services/stripe_shop_catalog.rb
class StripeShopCatalog
  class Error < StandardError; end

  PROMO_CODE = "FOUACE10"
  COUPON_ID = "fouace10"

  ITEMS = [
    {
      slug: "guide-vendeur-07700",
      lookup_key: "shop_guide_vendeur",
      price_lookup_key: "shop_price_guide_vendeur",
      name: "Guide vendeur 07700",
      description: "PDF lorem : check-list mise en vente, diagnostics et conseils agence Fenêtre Ouverte.",
      unit_amount: 2500,
      shippable: false,
      checkout_mode: :one_time,
      seller: :agency
    },
    {
      slug: "coffret-fouace-martin",
      lookup_key: "shop_coffret_fouace",
      price_lookup_key: "shop_price_coffret_fouace",
      name: "Coffret fouace du samedi",
      description: "Fouace aux figues + baguette levain — retrait en boutique. Code promo #{PROMO_CODE} (−10 %).",
      unit_amount: 1800,
      shippable: true,
      checkout_mode: :promo,
      seller: :merchant
    },
    {
      slug: "panier-decouverte-martin",
      lookup_key: "shop_panier_martin",
      price_lookup_key: "shop_price_panier_martin",
      name: "Panier découverte Martin",
      description: "Sélection de pains et viennoiseries du jour — retrait en boutique sous 24 h.",
      unit_amount: 1200,
      shippable: true,
      checkout_mode: :one_time,
      seller: :merchant
    },
    {
      slug: "audit-immo-express",
      lookup_key: "shop_audit_immo",
      price_lookup_key: "shop_price_audit_immo",
      name: "Audit immo express",
      description: "Visite conseil lorem : estimation, points de vigilance et plan d'action sous 48 h. Paiement en plusieurs fois via Checkout.",
      unit_amount: 9900,
      shippable: false,
      checkout_mode: :installment,
      seller: :agency
    },
    {
      slug: "don-territoire-07700",
      lookup_key: "shop_don_territoire",
      price_lookup_key: "shop_price_don_territoire",
      name: "Don au territoire 07700",
      description: "Montant libre (5 € à 200 €) pour soutenir l'info locale Fenêtre Ouverte.",
      unit_amount: 1000,
      custom: { minimum: 500, maximum: 20_000, preset: 1000 },
      shippable: false,
      checkout_mode: :custom,
      seller: :agency
    }
  ].freeze

  def self.sync!
    new.sync!
  end

  def sync!
    raise Error, "STRIPE_SECRET_KEY manquant" if ENV["STRIPE_SECRET_KEY"].blank?

    results = ITEMS.map { |item| upsert_item(item) }
    coupon = upsert_promo_coupon!
    { items: results, coupon: coupon }
  end

  private

  def upsert_item(item)
    product = find_or_create_product(item)
    price = find_or_create_price(item, product.id)
    product_record = update_local_product!(item, product.id, price.id)

    {
      slug: item[:slug],
      stripe_product_id: product.id,
      stripe_price_id: price.id,
      local_id: product_record&.id
    }
  end

  def find_or_create_product(item)
    existing = Stripe::Product.list(limit: 100).data.find { |p| p.metadata["lookup_key"] == item[:lookup_key] }
    return existing if existing

    Stripe::Product.create(
      name: item[:name],
      description: item[:description],
      shippable: item[:shippable],
      metadata: {
        lookup_key: item[:lookup_key],
        slug: item[:slug],
        plan: "boutique",
        checkout_mode: item[:checkout_mode].to_s,
        seller: item[:seller].to_s
      }
    )
  end

  def find_or_create_price(item, product_id)
    found = Stripe::Price.list(lookup_keys: [item[:price_lookup_key]], limit: 1).data.first
    return found if found

    params = {
      product: product_id,
      currency: "eur",
      lookup_key: item[:price_lookup_key],
      transfer_lookup_key: true,
      metadata: { slug: item[:slug], plan: "boutique" }
    }

    if item[:custom]
      params[:custom_unit_amount] = {
        enabled: true,
        minimum: item[:custom][:minimum],
        maximum: item[:custom][:maximum],
        preset: item[:custom][:preset]
      }
    else
      params[:unit_amount] = item[:unit_amount]
    end

    Stripe::Price.create(params)
  end

  def update_local_product!(item, stripe_product_id, stripe_price_id)
    record = Product.find_by(slug: item[:slug])
    return unless record

    record.update!(
      stripe_product_id: stripe_product_id,
      stripe_price_id: stripe_price_id,
      price_cents: item[:unit_amount],
      checkout_mode: item[:checkout_mode]
    )
    record
  end

  def upsert_promo_coupon!
    coupon = begin
      Stripe::Coupon.retrieve(COUPON_ID)
    rescue Stripe::InvalidRequestError
      Stripe::Coupon.create(
        id: COUPON_ID,
        percent_off: 10,
        duration: "once",
        name: "Fouace -10 %",
        metadata: { plan: "boutique", slug: "coffret-fouace-martin" }
      )
    end

    codes = Stripe::PromotionCode.list(code: PROMO_CODE, limit: 1).data
    promo = codes.first || Stripe::PromotionCode.create(
      promotion: { type: "coupon", coupon: coupon.id },
      code: PROMO_CODE,
      metadata: { plan: "boutique" }
    )

    { coupon_id: coupon.id, promotion_code: promo.code }
  end
end
