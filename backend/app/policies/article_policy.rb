# app/policies/article_policy.rb
class ArticlePolicy < ApplicationPolicy
  def index?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def show?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def create?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def update?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  def destroy?
    user&.super_admin? || (user&.admin? && agency_subscription_ok?)
  end

  class Scope < Scope
    def resolve
      if user&.super_admin?
        scope.all
      elsif user&.admin?
        scope.where(agency_id: user.agency_id)
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
