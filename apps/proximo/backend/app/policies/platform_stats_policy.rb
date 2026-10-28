# app/policies/platform_stats_policy.rb
class PlatformStatsPolicy < ApplicationPolicy
  def show?
    user&.super_admin?
  end
end
