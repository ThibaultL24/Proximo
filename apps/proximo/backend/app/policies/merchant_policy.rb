# app/policies/merchant_policy.rb
class MerchantPolicy < ApplicationPolicy
  def index?
    user&.admin? || user&.super_admin?
  end

  def show?
    user&.super_admin? || user&.admin? || owns_merchant?
  end

  def create?
    (user&.admin? || user&.super_admin?) && agency_subscription_ok?
  end

  def update?
    user&.super_admin? || user&.admin?
  end

  def update_profile?
    user&.merchant? && owns_merchant? && record.subscription_active?
  end

  def view_profile?
    user&.merchant? && owns_merchant?
  end

  def destroy?
    user&.super_admin? || user&.admin?
  end

  def qr?
    user&.super_admin? || user&.admin? || (owns_merchant? && record.subscription_active?)
  end

  def download_qr?
    user&.super_admin? || user&.admin? || (owns_merchant? && record.subscription_active?)
  end

  def manage_stripe?
    user&.merchant? && owns_merchant?
  end

  def manage_billing?
    user&.merchant? && owns_merchant?
  end

  def stats?
    user&.merchant? && owns_merchant?
  end

  class Scope < Scope
    def resolve
      if user&.super_admin?
        scope.all
      elsif user&.admin?
        scope.where(agency_id: user.agency_id)
      elsif user&.merchant?
        scope.where(id: user.merchant_id)
      else
        scope.none
      end
    end
  end

  private

  def agency_subscription_ok?
    return true if user&.super_admin?
    return false unless user&.admin? && user.agency

    user.agency.subscription_active?
  end

  def owns_merchant?
    user&.merchant_id.present? && record.id == user.merchant_id
  end
end
