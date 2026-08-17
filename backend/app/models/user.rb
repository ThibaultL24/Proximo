# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  belongs_to :merchant, optional: true
  has_many :articles, foreign_key: :author_id, dependent: :nullify
  has_many :submitted_leads, class_name: "Lead", foreign_key: :submitted_by_id, dependent: :restrict_with_error
  has_many :reviews, dependent: :destroy
  has_many :review_replies, dependent: :destroy

  enum :role, { merchant: 0, admin: 1, client: 2, super_admin: 3 }

  belongs_to :agency, optional: true

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password.present? }

  def full_name
    [first_name, last_name].compact_blank.join(" ")
  end

  def admin?
    role == "admin"
  end

  def super_admin?
    role == "super_admin"
  end

  def client?
    role == "client"
  end

  def subscription_active?
    return false unless client?

    ClientSubscriptionService.for(self).active?
  end
end
