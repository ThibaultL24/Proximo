# app/controllers/concerns/tenant_scoped.rb
module TenantScoped
  extend ActiveSupport::Concern

  private

  def current_agency
    return @current_agency if defined?(@current_agency)

    @current_agency = if current_user&.super_admin?
                        nil
                      elsif current_user&.admin?
                        current_user.agency
                      else
                        default_agency
                      end
  end

  def default_agency
    slug = ENV.fetch("DEFAULT_AGENCY_SLUG", "code-immo")
    Agency.find_by(slug: slug)
  end

  def scope_to_agency(relation)
    return relation if current_user&.super_admin?
    return relation.none unless current_agency

    relation.where(agency_id: current_agency.id)
  end

  def require_agency_subscription!
    return if current_user&.super_admin?
    return forbidden unless current_user&.admin? && current_user.agency

    return if AgencySubscriptionService.for(current_user.agency).active?

    render json: {
      error: "subscription_required",
      message: "Un abonnement agence actif est requis",
      subscription: AgencySubscriptionService.for(current_user.agency).status
    }, status: :payment_required
  end
end
