module Api
  module V1
    module Proximo
      class ClientDossiersController < ApplicationController
        before_action :authenticate_user!
        before_action :load_manager!

        def index
          dossiers = scoped_dossiers.order(created_at: :desc)
          render json: dossiers.map { |d| serialize(d) }
        end

        def show
          render json: serialize(scoped_dossiers.find(params[:id]))
        end

        def create
          dossier = scoped_dossiers.new(dossier_params.merge(
            created_by: current_user, consent_recorded_at: Time.current
          ))
          if dossier.save
            render json: serialize(dossier), status: :created
          else
            render json: { errors: dossier.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          dossier = scoped_dossiers.find(params[:id])
          if dossier.update(dossier_params.except(:data_consent))
            render json: serialize(dossier)
          else
            render json: { errors: dossier.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def load_manager!
          @membership = current_user.memberships.find_by(organization_id: params[:organization_id])
          return not_found unless @membership
          forbidden unless @membership.owner? || @membership.manager?
        end

        def scoped_dossiers
          @membership.organization.client_dossiers
        end

        def dossier_params
          params.require(:client_dossier).permit(
            :full_name, :email, :phone, :project_type, :property_city,
            :budget_min, :budget_max, :requirements, :mandate_reference,
            :data_consent, documents: []
          )
        end

        def serialize(dossier)
          {
            id: dossier.id, organization_id: dossier.organization_id,
            full_name: dossier.full_name, email: dossier.email, phone: dossier.phone,
            project_type: dossier.project_type, property_city: dossier.property_city,
            budget_min: dossier.budget_min, budget_max: dossier.budget_max,
            requirements: dossier.requirements, mandate_reference: dossier.mandate_reference,
            mandate_status: dossier.mandate_status,
            documents_count: dossier.documents.count,
            created_at: dossier.created_at, updated_at: dossier.updated_at
          }
        end
      end
    end
  end
end
