# db/migrate/20250808100001_create_publications_and_social.rb
class CreatePublicationsAndSocial < ActiveRecord::Migration[8.0]
  def change
    create_table :publications do |t|
      t.references :merchant, null: false, foreign_key: true
      t.references :agency, null: false, foreign_key: true
      t.text :body, null: false
      t.integer :category, default: 1, null: false
      t.integer :status, default: 0, null: false
      t.datetime :published_at
      t.boolean :syndicated, default: false, null: false
      t.timestamps
    end

    add_index :publications, :category
    add_index :publications, :status
    add_index :publications, :published_at

    create_table :social_accounts do |t|
      t.references :merchant, null: false, foreign_key: true
      t.integer :provider, null: false
      t.string :account_name, null: false
      t.string :external_id
      t.text :access_token
      t.text :refresh_token
      t.integer :status, default: 0, null: false
      t.datetime :connected_at
      t.timestamps
    end

    add_index :social_accounts, %i[merchant_id provider], unique: true

    create_table :social_posts do |t|
      t.references :publication, null: false, foreign_key: true
      t.integer :provider, null: false
      t.integer :status, default: 0, null: false
      t.string :external_post_id
      t.text :error_message
      t.datetime :published_at
      t.timestamps
    end

    add_index :social_posts, %i[publication_id provider], unique: true
  end
end
