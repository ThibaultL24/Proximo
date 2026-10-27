# test/services/qr_scan_recorder_test.rb
require "test_helper"

class QrScanRecorderTest < ActiveSupport::TestCase
  setup do
    @agency = create_agency!
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
  end

  test "increments merchant qr_scan_count on each scan" do
    assert_equal 0, @merchant.qr_scan_count

    QrScanRecorder.record!(merchant: @merchant, session_id: "sess-1")
    assert_equal 1, @merchant.reload.qr_scan_count
    assert_equal 1, @merchant.qr_scans.count

    QrScanRecorder.record!(merchant: @merchant, session_id: "sess-2")
    assert_equal 2, @merchant.reload.qr_scan_count
  end
end
