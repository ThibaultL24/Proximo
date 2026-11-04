# app/controllers/api/v1/health_controller.rb
module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: { status: "ok", app: "Proximo API", version: "0.2.0" }
      end
    end
  end
end
