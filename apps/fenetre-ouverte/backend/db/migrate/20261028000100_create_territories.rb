class CreateTerritories < ActiveRecord::Migration[8.0]
  def change
    create_table :territories do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :status, default: 0, null: false
      t.references :legacy_agency, index: { unique: true }, foreign_key: { to_table: :agencies }
      t.timestamps
    end
    add_index :territories, :slug, unique: true

    create_table :territory_memberships do |t|
      t.references :territory, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 0
      t.timestamps
    end
    add_index :territory_memberships, %i[territory_id user_id], unique: true

    add_reference :sectors, :territory, foreign_key: true
    add_reference :merchants, :territory, foreign_key: true
    add_reference :articles, :territory, foreign_key: true
    add_reference :publications, :territory, foreign_key: true
  end
end
