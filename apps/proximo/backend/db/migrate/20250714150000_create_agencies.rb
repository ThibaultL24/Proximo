# db/migrate/20250714150000_create_agencies.rb
class CreateAgencies < ActiveRecord::Migration[8.0]
  def change
    create_table :agencies do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :city
      t.string :email
      t.string :phone
      t.integer :status, default: 0, null: false
      t.string :stripe_customer_id
      t.string :stripe_subscription_id
      t.string :subscription_status
      t.datetime :subscription_current_period_end
      t.datetime :subscription_trial_ends_at
      t.timestamps
    end

    add_index :agencies, :slug, unique: true
    add_index :agencies, :stripe_customer_id, unique: true, where: "stripe_customer_id IS NOT NULL"
    add_index :agencies, :stripe_subscription_id, unique: true, where: "stripe_subscription_id IS NOT NULL"
    add_index :agencies, :subscription_status
    add_index :agencies, :status
  end
end
