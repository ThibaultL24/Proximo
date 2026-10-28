# db/migrate/20250617210001_add_qr_token_to_merchants.rb
class AddQrTokenToMerchants < ActiveRecord::Migration[8.0]
  def up
    add_column :merchants, :qr_token, :string
    add_index :merchants, :qr_token, unique: true

    ::Merchant.reset_column_information
    ::Merchant.find_each do |merchant|
      merchant.update_column(:qr_token, SecureRandom.alphanumeric(8).downcase)
    end

    change_column_null :merchants, :qr_token, false
  end

  def down
    remove_index :merchants, :qr_token
    remove_column :merchants, :qr_token
  end
end
