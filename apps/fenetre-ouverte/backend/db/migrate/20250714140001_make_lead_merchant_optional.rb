# db/migrate/20250714140001_make_lead_merchant_optional.rb
class MakeLeadMerchantOptional < ActiveRecord::Migration[8.0]
  def change
    change_column_null :leads, :merchant_id, true
  end
end
