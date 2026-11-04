# app/services/platform_secrets.rb
class PlatformSecrets
  def self.encrypt(value)
    return nil if value.blank?

    encryptor.encrypt_and_sign(value.to_s)
  end

  def self.decrypt(ciphertext)
    return nil if ciphertext.blank?

    encryptor.decrypt_and_verify(ciphertext)
  rescue ActiveSupport::MessageEncryptor::InvalidMessage
    nil
  end

  def self.encryptor
    key = Rails.application.secret_key_base.byteslice(0, 32)
    @encryptor ||= ActiveSupport::MessageEncryptor.new(key)
  end

  private_class_method :encryptor
end
