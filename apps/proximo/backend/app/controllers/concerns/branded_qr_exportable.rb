# app/controllers/concerns/branded_qr_exportable.rb
module BrandedQrExportable
  extend ActiveSupport::Concern

  included do
    include ActionController::MimeResponds
  end

  private

  def send_branded_qr(merchant, disposition: "attachment")
    filename_base = "qr-#{merchant.slug}"

    respond_to do |format|
      format.png do
        send_data BrandedQrCodeService.png_for(merchant),
                  type: "image/png",
                  disposition: "#{disposition}; filename=\"#{filename_base}.png\""
      end
      format.pdf do
        send_data BrandedQrCodeService.pdf_for(merchant),
                  type: "application/pdf",
                  disposition: "#{disposition}; filename=\"#{filename_base}.pdf\""
      end
    end
  end
end
