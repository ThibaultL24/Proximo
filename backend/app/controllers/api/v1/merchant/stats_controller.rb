# app/controllers/api/v1/merchant/stats_controller.rb
module Api
  module V1
    module Merchant
      class StatsController < ApplicationController
        before_action :authenticate_user!

        def show
          return forbidden unless current_user.merchant

          merchant = current_user.merchant
          authorize merchant, :stats?

          scans = merchant.qr_scans
          week_start = 7.days.ago

          render json: {
            merchant_name: merchant.name,
            qr_scan_count: scans.count,
            qr_unique_scans: scans.where.not(session_id: [nil, ""]).distinct.count(:session_id),
            qr_scans_this_week: scans.where(created_at: week_start..).count,
            qr_url: merchant.qr_url,
            qr_token: merchant.qr_token
          }
        end
      end
    end
  end
end
