# app/models/commission.rb
class Commission < ApplicationRecord
  belongs_to :lead

  enum :status, { eligible: 0, approved: 1, paid: 2, cancelled: 3 }

  validates :amount_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true
  validate :amount_must_be_positive_when_approved_or_paid

  def merchant
    lead.merchant
  end

  private

  def amount_must_be_positive_when_approved_or_paid
    return unless approved? || paid?
    return if amount_cents.positive?

    errors.add(:amount_cents, "doit etre superieur a 0 pour une commission approuvee ou payee")
  end
end
