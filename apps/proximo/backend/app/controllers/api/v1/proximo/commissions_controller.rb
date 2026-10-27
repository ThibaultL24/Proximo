module Api
  module V1
    module Proximo
      class CommissionsController < ApplicationController
        before_action :authenticate_user!
        before_action :load_manager!

        def index
          commissions = scoped_commissions.includes(:lead).order(created_at: :desc)
          render json: commissions.map { |commission| serialize(commission) }
        end

        def show
          commission = scoped_commissions.find(params[:id])
          render json: serialize(commission)
        end

        private

        def load_manager!
          membership = current_user.memberships.find_by(organization_id: params[:organization_id])
          return not_found unless membership
          forbidden unless membership.owner? || membership.manager?
        end

        def scoped_commissions
          Commission.joins(:lead).where(leads: { organization_id: params[:organization_id] })
        end

        def serialize(commission)
          {
            id: commission.id,
            lead_id: commission.lead_id,
            organization_id: commission.lead.organization_id,
            amount_cents: commission.amount_cents,
            platform_fee_cents: commission.platform_fee_cents,
            currency: commission.currency,
            status: commission.status,
            created_at: commission.created_at
          }
        end
      end
    end
  end
end
