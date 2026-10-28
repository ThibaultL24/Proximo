# app/controllers/api/v1/auth/sessions_controller.rb
module Api
  module V1
    module Auth
      class SessionsController < ApplicationController
        def create
          user = ::User.find_by(email: params[:email]&.downcase)

          if user&.authenticate(params[:password])
            token = JsonWebToken.encode({ user_id: user.id })
            render json: {
              token: token,
              user: UserSerializer.new(user).serializable_hash
            }
          else
            render json: { error: "Email ou mot de passe incorrect" }, status: :unauthorized
          end
        end

        def show
          authenticate_user!
          return if performed?

          authorize current_user
          render json: UserSerializer.new(current_user).serializable_hash
        end

        def destroy
          head :no_content
        end
      end
    end
  end
end
