# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include Pundit::Authorization

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  def pundit_user
    current_user
  end

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = nil
    header = request.headers["Authorization"]
    return nil if header.blank?

    token = header.split.last
    payload = JsonWebToken.decode(token)
    @current_user = ::User.find_by(id: payload[:user_id]) if payload
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  def authenticate_admin!
    authenticate_user!
    return if performed?

    forbidden unless current_user&.admin?
  end

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end
end
