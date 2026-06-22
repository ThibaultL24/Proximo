# app/policies/admin_stats_policy.rb
class AdminStatsPolicy < ApplicationPolicy
  def show?
    user&.admin?
  end
end
