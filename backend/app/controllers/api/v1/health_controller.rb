# app/controllers/api/v1/health_controller.rb
module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: { status: "ok", app: "Proxi Immo API", version: "0.1.0" }
      end
    end
  end
end
