# app/policies/lead_policy.rb
class LeadPolicy < ApplicationPolicy
  def index?
    user&.admin? || user&.merchant?
  end

  def show?
    user&.admin? || owns_lead?
  end

  def create?
    user&.merchant? && user.merchant.present?
  end

  def update?
    user&.admin?
  end

  def qualify?
    user&.admin?
  end

  def reject?
    user&.admin?
  end

  def convert?
    user&.admin?
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user&.merchant?
        scope.where(merchant_id: user.merchant_id)
      else
        scope.none
      end
    end
  end

  private

  def owns_lead?
    user&.merchant_id.present? && record.merchant_id == user.merchant_id
  end
end
