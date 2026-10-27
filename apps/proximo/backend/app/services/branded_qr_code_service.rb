# app/services/branded_qr_code_service.rb
class BrandedQrCodeService
  WIDTH = 620
  HEIGHT = 874

  COLORS = {
    petrol: "123c3a",
    paper: "faf7f2",
    sand: "e8e0d4",
    muted: "5c6b6a",
    white: "ffffff"
  }.freeze

  def self.png_for(merchant)
    new(merchant).to_png
  end

  def self.pdf_for(merchant)
    new(merchant).to_pdf
  end

  def initialize(merchant)
    @merchant = merchant
  end

  def to_pdf
    build_document.render
  end

  def to_png
    pdf_bytes = to_pdf
    require "vips"

    Vips::Image.new_from_buffer(pdf_bytes, "", dpi: 200, page: 0, n: -1).write_to_buffer(".png")
  rescue LoadError, Vips::Error => e
    Rails.logger.warn("Branded QR PNG rasterization failed: #{e.message}") if defined?(Rails)
    QrCodeService.png_for(merchant.qr_url)
  end

  private

  attr_reader :merchant

  def qr_png_bytes
    @qr_png_bytes ||= QrCodeService.png_for(merchant.qr_url)
  end

  def logo_bytes
    return @logo_bytes if defined?(@logo_bytes)
    return @logo_bytes = nil unless merchant.logo.attached?

    @logo_bytes = merchant.logo.download
  rescue StandardError
    @logo_bytes = nil
  end

  def subtitle
    [merchant.sector&.name, merchant.city.presence].compact.join(" · ")
  end

  def build_document
    require "prawn"
    Prawn::Fonts::AFM.hide_m17n_warning = true

    Prawn::Document.new(page_size: [WIDTH * 0.75, HEIGHT * 0.75], margin: 0) do |pdf|
      pdf.canvas do
        pdf.fill_color COLORS[:paper]
        pdf.fill_rectangle [0, pdf.bounds.top], pdf.bounds.width, pdf.bounds.height

        pdf.fill_color COLORS[:petrol]
        pdf.fill_rectangle [0, pdf.bounds.top], pdf.bounds.width, 66
        pdf.fill_color COLORS[:white]
        pdf.text_box "PROXI IMMO",
                     at: [0, pdf.bounds.top - 22],
                     width: pdf.bounds.width,
                     align: :center,
                     size: 11,
                     style: :bold

        logo_top = pdf.bounds.top - 92
        if logo_bytes
          pdf.image StringIO.new(logo_bytes), width: 54, at: [(pdf.bounds.width - 54) / 2, logo_top]
        end

        name_top = logo_bytes ? pdf.bounds.top - 160 : pdf.bounds.top - 96
        pdf.fill_color COLORS[:petrol]
        pdf.text_box sanitize_text(merchant.name),
                     at: [36, name_top],
                     width: pdf.bounds.width - 72,
                     align: :center,
                     size: 22,
                     style: :bold,
                     overflow: :shrink_to_fit

        if subtitle.present?
          pdf.fill_color COLORS[:muted]
          pdf.text_box sanitize_text(subtitle),
                       at: [36, logo_bytes ? pdf.bounds.top - 198 : pdf.bounds.top - 132],
                       width: pdf.bounds.width - 72,
                       align: :center,
                       size: 11
        end

        qr_top = logo_bytes ? pdf.bounds.top - 470 : pdf.bounds.top - 400
        qr_x = (pdf.bounds.width - 210) / 2
        pdf.fill_color COLORS[:white]
        pdf.fill_rectangle [qr_x - 12, qr_top + 12], 234, 234
        pdf.image StringIO.new(qr_png_bytes), width: 210, at: [qr_x, qr_top]

        pdf.fill_color COLORS[:petrol]
        pdf.text_box "Scannez pour acceder a notre fiche Proxi Immo",
                     at: [36, 130],
                     width: pdf.bounds.width - 72,
                     align: :center,
                     size: 12

        pdf.fill_color COLORS[:sand]
        pdf.fill_rectangle [0, 42], pdf.bounds.width, 42
        pdf.fill_color COLORS[:muted]
        pdf.text_box "proxi-immo.fr",
                     at: [0, 28],
                     width: pdf.bounds.width,
                     align: :center,
                     size: 9
      end
    end
  end

  def sanitize_text(text)
    text.to_s.encode("UTF-8", invalid: :replace, undef: :replace)
  end
end
