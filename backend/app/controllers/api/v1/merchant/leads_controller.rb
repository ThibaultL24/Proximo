# app/controllers/api/v1/merchant/leads_controller.rb
module Api
  module V1
    module Merchant
      class LeadsController < ApplicationController
        before_action :authenticate_user!

        def index
          authorize ::Lead
          leads = policy_scope(::Lead).includes(:merchant).order(created_at: :desc)
          render json: LeadSerializer.new(leads).serializable_hash
        end

        def create
          authorize ::Lead
          return forbidden unless current_user.merchant

          lead = current_user.submitted_leads.build(lead_params.merge(merchant: current_user.merchant))

          if lead.save
            LeadStatusRecorder.record!(
              lead: lead,
              user: current_user,
              from_status: nil,
              to_status: lead.status,
              note: "Lead cree"
            )
            render json: LeadSerializer.new(lead).serializable_hash, status: :created
          else
            render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def lead_params
          params.require(:lead).permit(
            :contact_name, :contact_email, :contact_phone, :lead_type,
            :property_address, :property_city, :description,
            :budget_min, :budget_max, :consent_given
          )
        end
      end
    end
  end
end
