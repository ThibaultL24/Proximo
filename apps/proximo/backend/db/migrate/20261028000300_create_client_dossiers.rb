class CreateClientDossiers < ActiveRecord::Migration[8.0]
  def change
    create_table :client_dossiers do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :full_name, null: false
      t.string :email
      t.string :phone
      t.integer :project_type, null: false, default: 0
      t.string :property_city
      t.integer :budget_min
      t.integer :budget_max
      t.text :requirements
      t.string :mandate_reference
      t.integer :mandate_status, null: false, default: 0
      t.boolean :data_consent, null: false, default: false
      t.datetime :consent_recorded_at
      t.timestamps
    end
    add_index :client_dossiers, %i[organization_id created_at]
  end
end
