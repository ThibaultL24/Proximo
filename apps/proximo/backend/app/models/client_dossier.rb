class ClientDossier < ApplicationRecord
  belongs_to :organization
  belongs_to :created_by, class_name: "User"
  has_many_attached :documents

  enum :project_type, { achat: 0, vente: 1, location: 2, investissement: 3 }
  enum :mandate_status, { non_recu: 0, a_verifier: 1, verifie: 2 }

  validates :full_name, :project_type, presence: true
  validates :data_consent, acceptance: { accept: true, message: "doit etre recue" }
  validates :budget_min, :budget_max, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validate :valid_budget_range

  private

  def valid_budget_range
    return unless budget_min && budget_max && budget_max < budget_min

    errors.add(:budget_max, "doit etre superieur au budget minimum")
  end
end
