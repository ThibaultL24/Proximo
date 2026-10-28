class CreateProximoOrganizationsAndPartners < ActiveRecord::Migration[8.0]
  def change
    create_table :organizations do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :status, null: false, default: 0
      t.timestamps
    end
    add_index :organizations, :slug, unique: true

    create_table :memberships do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 0
      t.timestamps
    end
    add_index :memberships, %i[organization_id user_id], unique: true

    create_table :partners do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.string :contact_email
      t.string :contact_phone
      t.integer :status, null: false, default: 0
      t.timestamps
    end
    add_index :partners, %i[organization_id slug], unique: true
  end
end
