# app/policies/lead_policy.rb
class LeadPolicy < ApplicationPolicy
  def index?
    user&.super_admin? || user&.admin? || user&.merchant? || user&.client?
  end

  def show?
    user&.super_admin? || user&.admin? || owns_lead? || submitted_lead?
  end

  def create?
    merchant_can_create? || client_can_create?
  end

  def update?
    user&.super_admin? || user&.admin?
  end

  def qualify?
    user&.super_admin? || user&.admin?
  end

  def reject?
    user&.super_admin? || user&.admin?
  end

  def convert?
    user&.super_admin? || user&.admin?
  end

  class Scope < Scope
    def resolve
      if user&.super_admin?
        scope.all
      elsif user&.admin?
        scope.where(agency_id: user.agency_id)
      elsif user&.merchant?
        scope.where(merchant_id: user.merchant_id)
      elsif user&.client?
        scope.where(submitted_by_id: user.id)
      else
        scope.none
      end
    end
  end

  private

  def merchant_can_create?
    user&.merchant? && user.merchant.present? && user.merchant.subscription_active?
  end

  def client_can_create?
    user&.client? && user.subscription_active?
  end

  def owns_lead?
    user&.merchant_id.present? && record.merchant_id == user.merchant_id
  end

  def submitted_lead?
    user&.client? && record.submitted_by_id == user.id
  end
end
