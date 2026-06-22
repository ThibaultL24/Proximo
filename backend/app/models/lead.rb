# app/models/lead.rb
class Lead < ApplicationRecord
  belongs_to :merchant
  belongs_to :submitted_by, class_name: "User"
  has_one :commission, dependent: :destroy
  has_many :lead_status_events, dependent: :destroy

  enum :lead_type, { buy: 0, sell: 1, rent: 2, other: 3 }
  enum :status, {
    received: 0,
    qualified: 1,
    in_progress: 2,
    converted: 3,
    rejected: 4,
    paid: 5
  }

  validates :contact_name, :contact_phone, :lead_type, presence: true
  validates :consent_given, acceptance: { message: "doit etre confirme" }
  validates :budget_min, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :budget_max, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validate :budget_max_must_be_greater_than_budget_min

  private

  def budget_max_must_be_greater_than_budget_min
    return if budget_min.blank? || budget_max.blank?
    return if budget_max >= budget_min

    errors.add(:budget_max, "doit etre superieur ou egal au budget minimum")
  end
end
