# app/services/commission_csv_exporter.rb
require "csv"

class CommissionCsvExporter
  HEADERS = [
    "ID",
    "Statut",
    "Montant EUR",
    "Lead ID",
    "Contact",
    "Commercant",
    "Date creation",
    "Date approbation",
    "Date paiement"
  ].freeze

  def self.generate(commissions)
    CSV.generate(headers: true, col_sep: ";") do |csv|
      csv << HEADERS

      commissions.find_each do |commission|
        lead = commission.lead
        csv << [
          commission.id,
          commission.status,
          format("%.2f", commission.amount_cents / 100.0),
          lead.id,
          lead.contact_name,
          lead.merchant.name,
          commission.created_at&.iso8601,
          commission.approved_at&.iso8601,
          commission.paid_at&.iso8601
        ]
      end
    end
  end
end
