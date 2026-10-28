# app/policies/admin_stats_policy.rb
class AdminStatsPolicy < ApplicationPolicy
  def show?
    user&.super_admin? || user&.admin?
  end
end
