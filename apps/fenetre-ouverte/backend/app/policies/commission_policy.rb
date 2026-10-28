# app/policies/commission_policy.rb
class CommissionPolicy < ApplicationPolicy
  def index?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def show?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def update?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def export?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def pay?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  class Scope < Scope
    def resolve
      if user&.super_admin?
        scope.all
      elsif user&.admin?
        scope.joins(:lead).where(leads: { agency_id: user.agency_id })
      else
        scope.none
      end
    end
  end

  private

  def agency_subscription_ok?
    user&.agency&.subscription_active?
  end
end
