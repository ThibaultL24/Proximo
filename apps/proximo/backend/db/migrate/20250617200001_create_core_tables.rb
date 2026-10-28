# db/migrate/20250617200001_create_core_tables.rb
class CreateCoreTables < ActiveRecord::Migration[8.0]
  def change
    create_table :sectors do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :city, null: false
      t.integer :position, default: 0, null: false
      t.timestamps
    end
    add_index :sectors, :slug, unique: true

    create_table :merchants do |t|
      t.references :sector, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.string :short_description
      t.text :description
      t.string :address
      t.string :postal_code
      t.string :city
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.string :phone
      t.string :email
      t.string :website
      t.json :opening_hours, default: {}
      t.integer :status, default: 0, null: false
      t.boolean :featured, default: false, null: false
      t.timestamps
    end
    add_index :merchants, :slug, unique: true
    add_index :merchants, :status

    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :role, default: 0, null: false
      t.string :first_name
      t.string :last_name
      t.string :phone
      t.references :merchant, foreign_key: true
      t.timestamps
    end
    add_index :users, :email, unique: true

    create_table :articles do |t|
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.references :merchant, foreign_key: true
      t.string :title, null: false
      t.string :slug, null: false
      t.text :excerpt
      t.text :body
      t.integer :category, default: 0, null: false
      t.integer :status, default: 0, null: false
      t.datetime :published_at
      t.timestamps
    end
    add_index :articles, :slug, unique: true
    add_index :articles, :status

    create_table :leads do |t|
      t.references :merchant, null: false, foreign_key: true
      t.references :submitted_by, null: false, foreign_key: { to_table: :users }
      t.string :contact_name, null: false
      t.string :contact_email
      t.string :contact_phone, null: false
      t.integer :lead_type, default: 0, null: false
      t.string :property_address
      t.string :property_city
      t.text :description
      t.integer :budget_min
      t.integer :budget_max
      t.integer :status, default: 0, null: false
      t.text :admin_notes
      t.datetime :qualified_at
      t.datetime :converted_at
      t.datetime :rejected_at
      t.string :rejection_reason
      t.timestamps
    end
    add_index :leads, :status

    create_table :commissions do |t|
      t.references :lead, null: false, foreign_key: true, index: { unique: true }
      t.integer :amount_cents, null: false
      t.string :currency, default: "EUR", null: false
      t.integer :status, default: 0, null: false
      t.string :stripe_account_id
      t.string :stripe_transfer_id
      t.datetime :approved_at
      t.datetime :paid_at
      t.timestamps
    end
  end
end
