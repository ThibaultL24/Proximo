# app/controllers/api/v1/platform/stats_controller.rb
module Api
  module V1
    module Platform
      class StatsController < ApplicationController
        before_action :authenticate_super_admin!

        def show
          authorize :platform_stats, :show?, policy_class: PlatformStatsPolicy
          render json: PlatformStatsBuilder.call
        end
      end
    end
  end
end
