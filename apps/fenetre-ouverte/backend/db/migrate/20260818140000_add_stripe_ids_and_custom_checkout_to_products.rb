# db/migrate/20260818140000_add_stripe_ids_and_custom_checkout_to_products.rb
class AddStripeIdsAndCustomCheckoutToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :stripe_product_id, :string
    add_column :products, :stripe_price_id, :string
    add_index :products, :stripe_price_id, unique: true, where: "stripe_price_id IS NOT NULL"
  end
end
