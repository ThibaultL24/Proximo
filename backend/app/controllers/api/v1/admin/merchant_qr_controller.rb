# app/controllers/api/v1/admin/merchant_qr_controller.rb
module Api
  module V1
    module Admin
      class MerchantQrController < ApplicationController
        include BrandedQrExportable

        before_action :authenticate_admin!

        def show
          merchant = ::Merchant.find(params[:merchant_id])
          authorize merchant, :qr?
          send_branded_qr(merchant)
        end
      end
    end
  end
end
