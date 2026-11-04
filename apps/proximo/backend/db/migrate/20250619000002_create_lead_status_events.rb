# db/migrate/20250619000002_create_lead_status_events.rb
class CreateLeadStatusEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :lead_status_events do |t|
      t.references :lead, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.string :from_status
      t.string :to_status, null: false
      t.text :note

      t.timestamps
    end
  end
end
