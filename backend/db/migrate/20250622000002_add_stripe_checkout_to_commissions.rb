# db/migrate/20250622000002_add_stripe_checkout_to_commissions.rb
class AddStripeCheckoutToCommissions < ActiveRecord::Migration[8.0]
  def change
    add_column :commissions, :stripe_checkout_session_id, :string
    add_index :commissions, :stripe_checkout_session_id, unique: true, where: "stripe_checkout_session_id IS NOT NULL"
  end
end
