# app/controllers/api/v1/merchant/qr_controller.rb
module Api
  module V1
    module Merchant
      class QrController < ApplicationController
        include BrandedQrExportable

        before_action :authenticate_user!
        before_action :set_merchant

        def show
          authorize @merchant, :download_qr?
          send_branded_qr(@merchant)
        end

        private

        def set_merchant
          return forbidden unless current_user.merchant

          @merchant = current_user.merchant
        end
      end
    end
  end
end
