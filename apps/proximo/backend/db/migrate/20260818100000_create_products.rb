# db/migrate/20260818100000_create_products.rb
class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.references :agency, null: false, foreign_key: true
      t.references :merchant, null: true, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.integer :price_cents, null: false
      t.string :currency, null: false, default: "EUR"
      t.integer :checkout_mode, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.integer :platform_fee_bps, null: false, default: 1000
      t.string :image_url
      t.timestamps
    end

    add_index :products, %i[agency_id slug], unique: true
    add_index :products, :status

    create_table :shop_orders do |t|
      t.references :product, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.string :customer_email
      t.integer :amount_cents, null: false
      t.string :currency, null: false, default: "EUR"
      t.integer :status, null: false, default: 0
      t.string :stripe_checkout_session_id
      t.string :stripe_payment_intent_id
      t.timestamps
    end

    add_index :shop_orders, :stripe_checkout_session_id, unique: true, where: "stripe_checkout_session_id IS NOT NULL"
  end
end
