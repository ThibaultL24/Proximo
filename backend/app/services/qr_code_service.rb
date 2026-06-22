# app/services/qr_code_service.rb
class QrCodeService
  def self.png_for(url)
    RQRCode::QRCode.new(url).as_png(
      border_modules: 2,
      color: "000000",
      fill: "ffffff",
      size: 300
    ).to_s
  end

  def self.frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end

  def self.merchant_qr_url(merchant)
    "#{frontend_url}/qr/#{merchant.qr_token}"
  end
end
