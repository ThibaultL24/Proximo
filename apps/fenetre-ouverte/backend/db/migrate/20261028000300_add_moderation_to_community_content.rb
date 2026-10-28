class AddModerationToCommunityContent < ActiveRecord::Migration[8.0]
  def change
    add_column :publications, :review_note, :text
    add_column :publications, :reviewed_at, :datetime
    add_reference :publications, :reviewed_by, foreign_key: { to_table: :users }
    add_column :publications, :requested_providers, :jsonb, null: false, default: []
    add_column :publications, :requested_syndication, :boolean, null: false, default: false

    create_table :merchant_profile_revisions do |t|
      t.references :merchant, null: false, foreign_key: true
      t.references :submitted_by, null: false, foreign_key: { to_table: :users }
      t.references :reviewed_by, foreign_key: { to_table: :users }
      t.jsonb :changeset, null: false, default: {}
      t.integer :status, null: false, default: 0
      t.text :review_note
      t.datetime :reviewed_at
      t.timestamps
    end
    add_index :merchant_profile_revisions, %i[merchant_id status]
  end
end
