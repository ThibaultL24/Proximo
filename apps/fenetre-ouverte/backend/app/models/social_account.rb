# Identifiants OAuth chiffrés avant écriture grâce au service de secrets
# déjà employé par les intégrations plateforme. Les anciens enregistrements
# lisibles restent accessibles jusqu'à exécution de la migration idempotente.
class SocialAccount < ApplicationRecord
  belongs_to :merchant

  enum :provider, {
    facebook: 0, instagram: 1, twitter: 2, linkedin: 3, tiktok: 4
  }
  enum :status, { connected: 0, expired: 1, error: 2 }

  validates :account_name, presence: true
  validates :provider, uniqueness: { scope: :merchant_id }
  scope :ready, -> { where(status: :connected) }

  CIPHERTEXT_PREFIX = "enc:v1:".freeze

  before_save :encrypt_legacy_token_fields

  def access_token
    read_token_attribute(:access_token)
  end

  def access_token=(value)
    write_token_attribute(:access_token, value)
  end

  def refresh_token
    read_token_attribute(:refresh_token)
  end

  def refresh_token=(value)
    write_token_attribute(:refresh_token, value)
  end

  def demo?
    access_token == "demo"
  end

  def encrypt_legacy_token_fields
    %i[access_token refresh_token].each do |column|
      raw = self[column]
      next if raw.blank? || raw.start_with?(CIPHERTEXT_PREFIX)

      self[column] = CIPHERTEXT_PREFIX + PlatformSecrets.encrypt(raw)
    end
  end

  private

  def read_token_attribute(column)
    raw = self[column]
    return nil if raw.blank?
    return raw unless raw.start_with?(CIPHERTEXT_PREFIX)

    PlatformSecrets.decrypt(raw.delete_prefix(CIPHERTEXT_PREFIX))
  end

  def write_token_attribute(column, value)
    raw = value.to_s
    self[column] = if raw.blank?
                     nil
                   elsif raw.start_with?(CIPHERTEXT_PREFIX)
                     raw
                   else
                     CIPHERTEXT_PREFIX + PlatformSecrets.encrypt(raw)
                   end
  end
end
