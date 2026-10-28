module Api
  module V1
    module Proximo
      class LeadsController < ApplicationController
        before_action :authenticate_user!
        before_action :load_membership!
        before_action :require_manager!, only: %i[qualify reject convert]

        def index
          render json: scoped_leads.includes(:submitted_by).order(created_at: :desc).map { |lead| serialize(lead) }
        end

        def show
          lead = scoped_leads.find(params[:id])
          render json: serialize(lead)
        end

        def create
          attrs = params.require(:lead).permit(
            :contact_name, :contact_email, :contact_phone, :lead_type,
            :property_address, :property_city, :description,
            :budget_min, :budget_max, :consent_given
          )
          # Never accept agency_id, organization_id, or submitted_by_id from the request.
          partner_id = params.require(:lead)[:partner_id]
          partner = partner_id.present? ? @membership.organization.partners.find(partner_id) : nil
          lead = @membership.organization.leads.new(
            attrs.merge(submitted_by: current_user, partner: partner, status: :received)
          )

          if lead.save
            LeadStatusRecorder.record!(
              lead: lead, user: current_user, from_status: nil,
              to_status: lead.status, note: "Lead cree"
            )
            render json: serialize(lead), status: :created
          else
            render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def qualify
          transition!(:qualified, note: params[:note])
        end

        def reject
          transition!(:rejected, note: params[:reason])
        end

        def convert
          transition!(:converted, note: params[:note], amount_cents: params[:amount_cents])
        end

        private

        def transition!(status, note:, amount_cents: nil)
          lead = @membership.organization.leads.find(params[:id])
          ProximoLeadWorkflow.transition!(
            lead: lead, actor: current_user, to: status,
            note: note, amount_cents: amount_cents
          )
          render json: serialize(lead.reload)
        rescue ProximoLeadWorkflow::InvalidTransition => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def require_manager!
          forbidden unless @membership.owner? || @membership.manager?
        end

        def load_membership!
          @membership = current_user.memberships.find_by(organization_id: params[:organization_id])
          not_found unless @membership
        end

        def scoped_leads
          leads = @membership.organization.leads
          return leads if @membership.owner? || @membership.manager?

          leads.where(submitted_by_id: current_user.id)
        end

        def serialize(lead)
          lead.as_json(only: %i[
            id organization_id partner_id submitted_by_id contact_name contact_email
            contact_phone lead_type property_address property_city description
            budget_min budget_max status consent_given created_at
          ])
        end
      end
    end
  end
end
