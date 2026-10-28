# app/controllers/api/v1/auth/agency_registrations_controller.rb
module Api
  module V1
    module Auth
      class AgencyRegistrationsController < ApplicationController
        def create
          result = AgencyRegistrationService.register!(params: agency_registration_params)
          user = result[:user]
          token = JsonWebToken.encode({ user_id: user.id })

          render json: {
            token: token,
            user: UserSerializer.new(user).serializable_hash,
            agency: {
              id: result[:agency].id,
              name: result[:agency].name,
              slug: result[:agency].slug
            }
          }, status: :created
        rescue AgencyRegistrationService::Error => e
          render json: { errors: [e.message] }, status: :unprocessable_entity
        end

        private

        def agency_registration_params
          params.require(:agency).permit(
            :agency_name, :city, :email, :password, :first_name, :last_name, :phone
          )
        end
      end
    end
  end
end
