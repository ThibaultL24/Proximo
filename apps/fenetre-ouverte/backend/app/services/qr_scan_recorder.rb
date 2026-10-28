# app/services/qr_scan_recorder.rb
class QrScanRecorder
  SALT = ENV.fetch("QR_SCAN_IP_SALT", Rails.application.credentials.secret_key_base.to_s)

  def self.record!(merchant:, session_id: nil, remote_ip: nil, user_agent: nil, referer: nil)
    merchant.qr_scans.create!(
      session_id: session_id.presence,
      ip_hash: hash_ip(remote_ip),
      user_agent: user_agent&.truncate(255),
      referer: referer&.truncate(255)
    )
  end

  def self.hash_ip(ip)
    return nil if ip.blank?

    Digest::SHA256.hexdigest("#{SALT}:#{ip}")
  end

  private_class_method :hash_ip
end
