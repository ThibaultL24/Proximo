class CreateGazetteEditions < ActiveRecord::Migration[8.0]
  def change
    create_table :gazette_editions do |t|
      t.references :agency, null: false, foreign_key: true
      t.string :issue_label, null: false
      t.string :edition_label, null: false
      t.integer :status, null: false, default: 0
      t.jsonb :settings, null: false, default: {}
      t.jsonb :assets_manifest, null: false, default: {}
      t.jsonb :pages, null: false, default: []
      t.datetime :published_at
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end

    add_index :gazette_editions, %i[agency_id issue_label], unique: true
    add_index :gazette_editions, %i[agency_id status published_at]
  end
end
