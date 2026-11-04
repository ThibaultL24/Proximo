# app/services/agency_registration_service.rb
class AgencyRegistrationService
  class Error < StandardError; end

  def self.register!(params:)
    new(params).register!
  end

  def initialize(params)
    @params = params
  end

  def register!
    ActiveRecord::Base.transaction do
      agency = Agency.create!(
        name: params[:agency_name],
        city: params[:city],
        email: params[:email],
        phone: params[:phone],
        status: :draft
      )

      user = User.create!(
        email: params[:email],
        password: params[:password],
        first_name: params[:first_name],
        last_name: params[:last_name],
        phone: params[:phone],
        role: :admin,
        agency: agency
      )

      { agency: agency, user: user }
    end
  rescue ActiveRecord::RecordInvalid => e
    raise Error, e.record.errors.full_messages.join(", ")
  end

  private

  attr_reader :params
end
