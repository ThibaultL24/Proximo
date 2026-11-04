# db/migrate/20260817200000_add_platform_fee_to_commissions.rb
class AddPlatformFeeToCommissions < ActiveRecord::Migration[8.0]
  def change
    add_column :commissions, :platform_fee_cents, :integer, default: 0, null: false
  end
end
