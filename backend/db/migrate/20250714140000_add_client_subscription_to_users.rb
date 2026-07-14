# db/migrate/20250714140000_add_client_subscription_to_users.rb
class AddClientSubscriptionToUsers < ActiveRecord::Migration[8.0]
  def change
    change_table :users, bulk: true do |t|
      t.string :stripe_customer_id
      t.string :stripe_subscription_id
      t.string :subscription_status
      t.datetime :subscription_current_period_end
      t.datetime :subscription_trial_ends_at
    end

    add_index :users, :stripe_customer_id, unique: true, where: "stripe_customer_id IS NOT NULL"
    add_index :users, :stripe_subscription_id, unique: true, where: "stripe_subscription_id IS NOT NULL"
    add_index :users, :subscription_status
  end
end
