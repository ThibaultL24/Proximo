# app/controllers/api/v1/client/leads_controller.rb
module Api
  module V1
    module Client
      class LeadsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_client!
        before_action :require_client_subscription!, only: :create

        def index
          authorize ::Lead
          leads = policy_scope(::Lead).includes(:merchant).order(created_at: :desc)
          render json: LeadSerializer.new(leads).serializable_hash
        end

        def create
          authorize ::Lead
          merchant = resolve_merchant
          if merchant_requested? && merchant.nil?
            return render json: { error: "Commerçant introuvable ou non publié" }, status: :unprocessable_entity
          end

          lead = current_user.submitted_leads.build(
            lead_params.merge(merchant: merchant, agency: merchant&.agency || current_user.agency || default_agency)
          )

          if lead.save
            LeadStatusRecorder.record!(
              lead: lead,
              user: current_user,
              from_status: nil,
              to_status: lead.status,
              note: merchant ? "Lead via #{merchant.name}" : "Lead direct agence"
            )
            render json: LeadSerializer.new(lead).serializable_hash, status: :created
          else
            render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def require_client!
          forbidden unless current_user&.client?
        end

        def require_client_subscription!
          return if ClientSubscriptionService.for(current_user).active?

          render json: {
            error: "subscription_required",
            message: "Un abonnement actif est requis pour transmettre un projet",
            subscription: ClientSubscriptionService.for(current_user).status
          }, status: :payment_required
        end

        def resolve_merchant
          return nil unless merchant_requested?

          if params[:merchant_id].present?
            ::Merchant.published.find_by(id: params[:merchant_id])
          else
            ::Merchant.published.find_by(slug: params[:merchant_slug])
          end
        end

        def merchant_requested?
          params[:merchant_id].present? || params[:merchant_slug].present?
        end

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
