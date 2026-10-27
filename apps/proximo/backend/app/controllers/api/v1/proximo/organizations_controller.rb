module Api
  module V1
    module Proximo
      class OrganizationsController < ApplicationController
        before_action :authenticate_user!

        def index
          organizations = current_user.organizations.order(:name)
          render json: organizations.map { |organization| serialize(organization) }
        end

        def show
          organization = current_user.organizations.find(params[:id])
          render json: serialize(organization)
        end

        private

        def serialize(organization)
          organization.as_json(only: %i[id name slug status])
        end
      end
    end
  end
end
