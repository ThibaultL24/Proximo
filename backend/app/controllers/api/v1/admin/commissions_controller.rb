# app/controllers/api/v1/admin/commissions_controller.rb
module Api
  module V1
    module Admin
      class CommissionsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_commission, only: %i[show update]

        def index
          authorize ::Commission
          commissions = policy_scope(::Commission)
                        .includes(lead: :merchant)
                        .order(created_at: :desc)
          commissions = commissions.where(status: params[:status]) if params[:status].present?
          render json: CommissionSerializer.new(commissions).serializable_hash
        end

        def show
          authorize @commission
          render json: CommissionSerializer.new(@commission).serializable_hash
        end

        def update
          authorize @commission
          attrs = commission_params.to_h
          attrs["approved_at"] = Time.current if attrs["status"] == "approved" && !@commission.approved_at
          attrs["paid_at"] = Time.current if attrs["status"] == "paid" && !@commission.paid_at

          if @commission.update(attrs)
            render json: CommissionSerializer.new(@commission).serializable_hash
          else
            render json: { errors: @commission.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export
          authorize ::Commission, :export?
          commissions = policy_scope(::Commission).includes(lead: :merchant).order(created_at: :desc)
          commissions = commissions.where(status: params[:status]) if params[:status].present?

          send_data(
            CommissionCsvExporter.generate(commissions),
            filename: "commissions-#{Date.current.iso8601}.csv",
            type: "text/csv; charset=utf-8"
          )
        end

        private

        def set_commission
          @commission = ::Commission.find(params[:id])
        end

        def commission_params
          params.require(:commission).permit(:status, :amount_cents, :currency)
        end
      end
    end
  end
end
