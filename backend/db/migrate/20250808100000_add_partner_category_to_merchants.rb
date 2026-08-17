# db/migrate/20250808100000_add_partner_category_to_merchants.rb
class AddPartnerCategoryToMerchants < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :partner_category, :integer, default: 1, null: false
    add_index :merchants, :partner_category
  end
end
