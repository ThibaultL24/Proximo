# app/controllers/api/v1/admin/leads_controller.rb
module Api
  module V1
    module Admin
      class LeadsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_lead, only: %i[show update qualify reject convert]

        def index
          authorize ::Lead
          leads = policy_scope(::Lead).includes(:merchant, :submitted_by, :lead_status_events).order(created_at: :desc)
          leads = leads.where(status: params[:status]) if params[:status].present?
          render json: LeadSerializer.new(leads).serializable_hash
        end

        def show
          authorize @lead
          render json: LeadSerializer.new(@lead).serializable_hash
        end

        def update
          authorize @lead
          previous_status = @lead.status

          if @lead.update(lead_params)
            record_status_change(@lead, previous_status) if @lead.saved_change_to_status?
            render json: LeadSerializer.new(@lead).serializable_hash
          else
            render json: { errors: @lead.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def qualify
          authorize @lead, :qualify?
          transition_lead!(:qualified, note: params[:note])
        end

        def reject
          authorize @lead, :reject?
          previous_status = @lead.status
          @lead.update!(
            status: :rejected,
            rejected_at: Time.current,
            rejection_reason: params[:reason]
          )
          LeadStatusRecorder.record!(
            lead: @lead,
            user: current_user,
            from_status: previous_status,
            to_status: @lead.status,
            note: params[:reason]
          )
          render json: LeadSerializer.new(@lead).serializable_hash
        end

        def convert
          authorize @lead, :convert?
          amount_cents = params[:amount_cents].presence&.to_i
          transition_lead!(:converted, note: params[:note], amount_cents: amount_cents)
        end

        private

        def set_lead
          @lead = ::Lead.find(params[:id])
        end

        def lead_params
          params.require(:lead).permit(:status, :admin_notes)
        end

        def transition_lead!(new_status, note: nil, amount_cents: nil)
          previous_status = @lead.status
          timestamp_attrs = case new_status.to_s
                            when "qualified" then { qualified_at: Time.current }
                            when "converted" then { converted_at: Time.current }
                            else {}
                            end

          ::Lead.transaction do
            @lead.update!(status: new_status, **timestamp_attrs)
            LeadStatusRecorder.record!(
              lead: @lead,
              user: current_user,
              from_status: previous_status,
              to_status: @lead.status,
              note: note
            )
            CommissionCreator.create_for_converted_lead!(lead: @lead, amount_cents: amount_cents) if new_status.to_s == "converted"
          end

          render json: LeadSerializer.new(@lead).serializable_hash
        end

        def record_status_change(lead, previous_status)
          LeadStatusRecorder.record!(
            lead: lead,
            user: current_user,
            from_status: previous_status,
            to_status: lead.status,
            note: lead.admin_notes
          )
        end
      end
    end
  end
end
