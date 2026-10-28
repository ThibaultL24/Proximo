# db/migrate/20250714130000_add_subscription_to_merchants.rb
class AddSubscriptionToMerchants < ActiveRecord::Migration[8.0]
  def change
    change_table :merchants, bulk: true do |t|
      t.string :stripe_customer_id
      t.string :stripe_subscription_id
      t.string :subscription_status
      t.datetime :subscription_current_period_end
      t.datetime :subscription_trial_ends_at
    end

    add_index :merchants, :stripe_customer_id, unique: true, where: "stripe_customer_id IS NOT NULL"
    add_index :merchants, :stripe_subscription_id, unique: true, where: "stripe_subscription_id IS NOT NULL"
    add_index :merchants, :subscription_status
  end
end
