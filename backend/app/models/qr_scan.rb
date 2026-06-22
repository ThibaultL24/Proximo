# app/models/qr_scan.rb
class QrScan < ApplicationRecord
  belongs_to :merchant

  validates :merchant, presence: true
end
