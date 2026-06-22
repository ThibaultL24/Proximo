# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  belongs_to :merchant, optional: true
  has_many :articles, foreign_key: :author_id, dependent: :nullify
  has_many :submitted_leads, class_name: "Lead", foreign_key: :submitted_by_id, dependent: :restrict_with_error

  enum :role, { merchant: 0, admin: 1 }

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password.present? }

  def full_name
    [first_name, last_name].compact_blank.join(" ")
  end

  def admin?
    role == "admin"
  end
end
