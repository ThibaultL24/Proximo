# db/migrate/20250622000001_add_stripe_to_merchants.rb
class AddStripeToMerchants < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :stripe_account_id, :string
    add_column :merchants, :stripe_onboarding_completed, :boolean, default: false, null: false
    add_index :merchants, :stripe_account_id, unique: true, where: "stripe_account_id IS NOT NULL"
  end
end
