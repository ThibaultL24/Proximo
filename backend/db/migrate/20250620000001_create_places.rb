# db/migrate/20250620000001_create_places.rb
class CreatePlaces < ActiveRecord::Migration[8.0]
  def change
    create_table :places do |t|
      t.references :parent, foreign_key: { to_table: :places }
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :kind, null: false, default: 0
      t.string :insee_code
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :places, %i[parent_id slug], unique: true
    add_index :places, :insee_code, unique: true
    add_index :places, :kind

    add_reference :merchants, :place, foreign_key: true
    add_reference :articles, :place, foreign_key: true
  end
end
