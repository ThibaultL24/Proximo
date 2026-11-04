class CreatePropertyListings < ActiveRecord::Migration[8.0]
  def change
    create_table :property_listings do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description, null: false
      t.string :city, null: false
      t.string :postal_code
      t.string :property_kind, null: false, default: "appartement"
      t.integer :transaction_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.bigint :price_cents
      t.decimal :area_sqm, precision: 9, scale: 2
      t.integer :rooms
      t.integer :bedrooms
      t.string :mandate_reference
      t.string :energy_class
      t.string :ghg_class
      t.datetime :prepared_at
      t.timestamps
    end
    add_index :property_listings, %i[organization_id status created_at],
              name: "index_property_listings_on_organization_and_status"
  end
end
