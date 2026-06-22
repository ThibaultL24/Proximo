# db/migrate/20250617220001_add_qr_scan_count_to_merchants.rb
class AddQrScanCountToMerchants < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :qr_scan_count, :integer, default: 0, null: false
  end
end
