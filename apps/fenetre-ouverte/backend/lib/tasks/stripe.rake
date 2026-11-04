# lib/tasks/stripe.rake
namespace :stripe do
  desc "Create Proxi Immo subscription products and prices in Stripe (test or live)"
  task setup_products: :environment do
    abort "STRIPE_SECRET_KEY manquant" if ENV["STRIPE_SECRET_KEY"].blank?

    merchant_product = find_or_create_product(
      lookup_key: "product_merchant",
      name: "Proxi Immo Commerçant",
      description: "Fiche vitrine, QR code, contenu et transmission de leads",
      plan: "merchant"
    )

    merchant_price = find_or_create_price(
      lookup_key: "plan_merchant_monthly",
      product_id: merchant_product.id,
      unit_amount: 1200,
      currency: "eur"
    )

    client_product = find_or_create_product(
      lookup_key: "product_client",
      name: "Proxi Immo Citoyen",
      description: "Envoi de leads immobiliers via la plateforme",
      plan: "client"
    )

    client_price = find_or_create_price(
      lookup_key: "plan_client_monthly",
      product_id: client_product.id,
      unit_amount: 200,
      currency: "eur"
    )

    agency_product = find_or_create_product(
      lookup_key: "product_agency",
      name: "Proxi Immo Agence",
      description: "Licence plateforme white-label pour agences immobilieres",
      plan: "agency"
    )

    agency_price = find_or_create_price(
      lookup_key: "plan_agency_monthly",
      product_id: agency_product.id,
      unit_amount: 12_500,
      currency: "eur"
    )

    puts ""
    puts "Ajoutez ces variables dans backend/.env :"
    puts "STRIPE_PRICE_MERCHANT_MONTHLY=#{merchant_price.id}"
    puts "STRIPE_PRICE_CLIENT_MONTHLY=#{client_price.id}"
    puts "STRIPE_PRICE_AGENCY_MONTHLY=#{agency_price.id}"
    puts ""
    puts "Puis configurez le webhook Stripe vers POST /api/v1/webhooks/stripe"
    puts "Evenements : checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed, account.updated"
  end

  desc "Create one-time boutique products (digital, physical, promo, installment, pay-what-you-want)"
  task setup_shop_products: :environment do
    result = StripeShopCatalog.sync!
    puts "Boutique Stripe :"
    result[:items].each do |item|
      puts "  #{item[:slug]}  product=#{item[:stripe_product_id]}  price=#{item[:stripe_price_id]}"
    end
    puts "Promo : #{result[:coupon][:promotion_code]} (coupon #{result[:coupon][:coupon_id]})"
  end

  def find_or_create_product(lookup_key:, name:, description:, plan:)
    existing = Stripe::Product.list(limit: 100).data.find { |p| p.metadata["lookup_key"] == lookup_key }
    return existing if existing

    Stripe::Product.create(
      name: name,
      description: description,
      metadata: { lookup_key: lookup_key, plan: plan }
    )
  end

  def find_or_create_price(lookup_key:, product_id:, unit_amount:, currency:)
    prices = Stripe::Price.list(lookup_keys: [lookup_key], limit: 1)
    return prices.data.first if prices.data.any?

    Stripe::Price.create(
      product: product_id,
      unit_amount: unit_amount,
      currency: currency,
      recurring: { interval: "month" },
      lookup_key: lookup_key,
      transfer_lookup_key: true
    )
  end
end
