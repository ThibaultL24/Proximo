# app/controllers/api/v1/auth/registrations_controller.rb
module Api
  module V1
    module Auth
      class RegistrationsController < ApplicationController
        def create
          user = ::User.new(registration_params.merge(role: :client, agency: default_agency))

          if user.save
            token = JsonWebToken.encode({ user_id: user.id })
            render json: {
              token: token,
              user: UserSerializer.new(user).serializable_hash
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def registration_params
          params.require(:user).permit(:email, :password, :first_name, :last_name, :phone)
        end
      end
    end
  end
end
