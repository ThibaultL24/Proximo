# app/controllers/api/v1/admin/stats_controller.rb
module Api
  module V1
    module Admin
      class StatsController < ApplicationController
        before_action :authenticate_admin!

        def show
          authorize :admin_stats, :show?, policy_class: AdminStatsPolicy
          render json: AdminStatsBuilder.call
        end
      end
    end
  end
end
