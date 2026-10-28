module Api
  module V1
    module Proximo
      class PartnersController < ApplicationController
        before_action :authenticate_user!
        before_action :load_membership!

        def index
          partners = @membership.organization.partners.order(:name)
          render json: partners.map { |partner| serialize(partner) }
        end

        def show
          partner = @membership.organization.partners.find(params[:id])
          render json: serialize(partner)
        end

        def create
          return forbidden unless can_write?

          partner = @membership.organization.partners.new(partner_params)
          if partner.save
            render json: serialize(partner), status: :created
          else
            render json: { errors: partner.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          return forbidden unless can_write?

          partner = @membership.organization.partners.find(params[:id])
          if partner.update(partner_params)
            render json: serialize(partner)
          else
            render json: { errors: partner.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def load_membership!
          @membership = current_user.memberships.includes(:organization).find_by(organization_id: params[:organization_id])
          not_found unless @membership
        end

        def can_write?
          @membership.owner? || @membership.manager?
        end

        def partner_params
          params.require(:partner).permit(:name, :slug, :contact_email, :contact_phone, :status)
        end

        def serialize(partner)
          partner.as_json(only: %i[id organization_id name slug contact_email contact_phone status])
        end
      end
    end
  end
end
