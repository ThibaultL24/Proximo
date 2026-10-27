# test/services/app_urls_test.rb
require "test_helper"

class AppUrlsTest < ActiveSupport::TestCase
  setup do
    @agency = create_agency!
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
  end

  test "uses explicit FRONTEND_URL when set" do
    with_env("FRONTEND_URL" => "https://example.test/") do
      assert_equal "https://example.test", AppUrls.frontend_url
    end
  end

  test "merchant qr url uses frontend url helper" do
    with_env("FRONTEND_URL" => "https://demo.test") do
      assert_equal "https://demo.test/qr/#{@merchant.qr_token}", QrCodeService.merchant_qr_url(@merchant)
    end
  end

  private

  def with_env(vars)
    previous = vars.keys.index_with { |key| ENV[key] }
    vars.each { |key, value| ENV[key] = value }
    yield
  ensure
    previous.each do |key, value|
      value.nil? ? ENV.delete(key) : ENV[key] = value
    end
  end
end
