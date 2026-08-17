# test/services/boutique_checkout_service_test.rb
require "test_helper"

class BoutiqueCheckoutServiceTest < ActiveSupport::TestCase
  setup do
    @agency = create_agency!(slug: "boutique-agency-#{SecureRandom.hex(4)}")
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
  end

  test "rejects unpublished product" do
    product = @agency.products.create!(
      name: "Test",
      slug: "test-#{SecureRandom.hex(4)}",
      price_cents: 1000,
      checkout_mode: :one_time,
      status: :draft
    )

    error = assert_raises(BoutiqueCheckoutService::Error) do
      BoutiqueCheckoutService.new(product, nil).send(:validate!)
    end
    assert_match(/indisponible/i, error.message)
  end

  test "merchant product requires stripe connect" do
    product = @agency.products.create!(
      name: "Coffret",
      slug: "coffret-#{SecureRandom.hex(4)}",
      price_cents: 1800,
      checkout_mode: :promo,
      status: :published,
      merchant: @merchant
    )

    error = assert_raises(BoutiqueCheckoutService::Error) do
      BoutiqueCheckoutService.new(product, nil).send(:validate!)
    end
    assert_match(/Stripe Connect/i, error.message)
  end

  test "platform fee is ten percent for merchant products" do
    product = @agency.products.create!(
      name: "Panier",
      slug: "panier-#{SecureRandom.hex(4)}",
      price_cents: 2000,
      checkout_mode: :one_time,
      status: :published,
      merchant: @merchant
    )

    assert_equal 200, product.platform_fee_cents
    assert_equal 1800, product.merchant_amount_cents
  end
end
