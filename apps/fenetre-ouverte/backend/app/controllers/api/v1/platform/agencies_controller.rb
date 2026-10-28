# app/controllers/api/v1/platform/agencies_controller.rb
module Api
  module V1
    module Platform
      class AgenciesController < ApplicationController
        before_action :authenticate_super_admin!

        def index
          agencies = Agency.order(created_at: :desc).includes(:merchants)
          render json: agencies.map { |agency| serialize_agency(agency) }
        end

        def show
          agency = Agency.find(params[:id])
          render json: serialize_agency(agency, detailed: true)
        end

        private

        def serialize_agency(agency, detailed: false)
          payload = {
            id: agency.id,
            name: agency.name,
            slug: agency.slug,
            city: agency.city,
            email: agency.email,
            status: agency.status,
            subscription: AgencySubscriptionService.for(agency).status,
            merchants_count: agency.merchants.count,
            clients_count: User.client.where(agency_id: agency.id).count,
            leads_count: agency.leads.count,
            created_at: agency.created_at
          }

          if detailed
            payload[:admins] = agency.admin_users.map do |user|
              { id: user.id, email: user.email, full_name: user.full_name }
            end
          end

          payload
        end
      end
    end
  end
end
