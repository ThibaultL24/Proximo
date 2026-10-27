# db/migrate/20260818130000_create_platform_integrations.rb
class CreatePlatformIntegrations < ActiveRecord::Migration[8.0]
  def change
    create_table :platform_integrations do |t|
      t.string :frontend_url
      t.string :backend_url
      t.string :meta_app_id
      t.text :meta_app_secret_ciphertext
      t.string :meta_redirect_uri
      t.string :meta_login_config_id
      t.string :tiktok_client_key
      t.text :tiktok_client_secret_ciphertext
      t.string :tiktok_redirect_uri
      t.timestamps
    end
  end
end
