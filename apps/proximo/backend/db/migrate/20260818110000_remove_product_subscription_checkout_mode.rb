# db/migrate/20260818110000_remove_product_subscription_checkout_mode.rb
class RemoveProductSubscriptionCheckoutMode < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      UPDATE products SET checkout_mode = 0 WHERE checkout_mode = 2;
      UPDATE products SET checkout_mode = 2 WHERE checkout_mode = 3;
    SQL
  end

  def down
    # installment (2) cannot be restored to subscription (2) — no-op
  end
end
