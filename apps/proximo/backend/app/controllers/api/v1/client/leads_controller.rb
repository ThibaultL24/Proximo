# app/controllers/api/v1/client/leads_controller.rb
module Api
  module V1
    module Client
      class LeadsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_client!

        def index
          authorize ::Lead
          leads = policy_scope(::Lead).includes(:merchant).order(created_at: :desc)
          render json: LeadSerializer.new(leads).serializable_hash
        end

        def create
          render json: {
            error: "Un projet immobilier se transmet auprès d'un commerçant partenaire, pas depuis le site."
          }, status: :forbidden
        end

        private

        def require_client!
          forbidden unless current_user&.client?
        end
      end
    end
  end
end
