# db/migrate/20260818120000_add_social_page_fields_to_merchants.rb
class AddSocialPageFieldsToMerchants < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :facebook_page_url, :string
    add_column :merchants, :instagram_handle, :string
    add_column :merchants, :tiktok_handle, :string
  end
end
