# app/policies/merchant_policy.rb
class MerchantPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    user&.admin? || owns_merchant?
  end

  def create?
    user&.admin?
  end

  def update?
    user&.admin?
  end

  def update_profile?
    user&.merchant? && owns_merchant?
  end

  def destroy?
    user&.admin?
  end

  def qr?
    user&.admin? || owns_merchant?
  end

  def download_qr?
    user&.admin? || owns_merchant?
  end

  def manage_stripe?
    user&.merchant? && owns_merchant?
  end

  def stats?
    user&.merchant? && owns_merchant?
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user&.merchant?
        scope.where(id: user.merchant_id)
      else
        scope.none
      end
    end
  end

  private

  def owns_merchant?
    user&.merchant_id.present? && record.id == user.merchant_id
  end
end
