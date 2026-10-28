# app/policies/user_policy.rb
class UserPolicy < ApplicationPolicy
  def show?
    user.present? && (user.admin? || record.id == user.id)
  end
end
