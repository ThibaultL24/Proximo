# db/migrate/20250619000003_create_qr_scans.rb
class CreateQrScans < ActiveRecord::Migration[8.0]
  def change
    create_table :qr_scans do |t|
      t.references :merchant, null: false, foreign_key: true
      t.string :session_id
      t.string :ip_hash
      t.string :user_agent
      t.string :referer

      t.timestamps
    end

    add_index :qr_scans, %i[merchant_id session_id]
    add_index :qr_scans, :created_at
  end
end
