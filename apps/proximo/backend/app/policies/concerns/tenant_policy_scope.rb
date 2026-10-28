# app/policies/concerns/tenant_policy_scope.rb
module TenantPolicyScope
  def resolve_for_tenant
    if user&.super_admin?
      scope.all
    elsif user&.admin? && user.agency_id.present?
      scope.where(agency_id: user.agency_id)
    elsif user&.merchant?
      merchant_scope
    elsif user&.client?
      client_scope
    else
      scope.none
    end
  end

  private

  def merchant_scope
    scope.none
  end

  def client_scope
    scope.none
  end
end
