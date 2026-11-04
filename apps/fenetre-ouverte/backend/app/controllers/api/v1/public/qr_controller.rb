# app/controllers/api/v1/public/qr_controller.rb
module Api
  module V1
    module Public
      class QrController < ApplicationController
        before_action :set_merchant

        def show
          render json: MerchantDetailSerializer.new(@merchant).serializable_hash
        end

        def scan
          QrScanRecorder.record!(
            merchant: @merchant,
            session_id: params[:session_id],
            remote_ip: request.remote_ip,
            user_agent: request.user_agent,
            referer: request.referer
          )
          head :no_content
        end

        def image
          png = BrandedQrCodeService.png_for(@merchant)
          send_data png, type: "image/png", disposition: "inline", filename: "qr-#{@merchant.slug}.png"
        end

        private

        def set_merchant
          @merchant = ::Merchant.published.find_by!(qr_token: params[:token])
        end
      end
    end
  end
end
