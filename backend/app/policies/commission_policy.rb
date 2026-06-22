# app/policies/commission_policy.rb
class CommissionPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    user&.admin?
  end

  def update?
    user&.admin?
  end

  def export?
    user&.admin?
  end

  class Scope < Scope
    def resolve
      user&.admin? ? scope.all : scope.none
    end
  end
end
