# app/models/platform_integration.rb
class PlatformIntegration < ApplicationRecord
  validates :meta_app_id, length: { maximum: 255 }, allow_blank: true
  validates :meta_redirect_uri, :meta_login_config_id, :tiktok_client_key, :tiktok_redirect_uri,
            :frontend_url, :backend_url, length: { maximum: 255 }, allow_blank: true

  def self.instance
    first || create!
  end

  def meta_app_secret=(plain)
    return if plain.blank?

    self.meta_app_secret_ciphertext = PlatformSecrets.encrypt(plain)
  end

  def meta_app_secret
    PlatformSecrets.decrypt(meta_app_secret_ciphertext)
  end

  def meta_app_secret_configured?
    meta_app_secret_ciphertext.present?
  end

  def tiktok_client_secret=(plain)
    return if plain.blank?

    self.tiktok_client_secret_ciphertext = PlatformSecrets.encrypt(plain)
  end

  def tiktok_client_secret
    PlatformSecrets.decrypt(tiktok_client_secret_ciphertext)
  end

  def tiktok_client_secret_configured?
    tiktok_client_secret_ciphertext.present?
  end
end
