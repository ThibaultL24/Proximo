# app/models/qr_scan.rb
class QrScan < ApplicationRecord
  belongs_to :merchant, counter_cache: :qr_scan_count

  validates :merchant, presence: true
end
