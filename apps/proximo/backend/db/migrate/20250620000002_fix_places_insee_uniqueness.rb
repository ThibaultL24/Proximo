# db/migrate/20250620000002_fix_places_insee_uniqueness.rb
class FixPlacesInseeUniqueness < ActiveRecord::Migration[8.0]
  def change
    remove_index :places, :insee_code
    add_index :places, %i[kind insee_code], unique: true
  end
end
