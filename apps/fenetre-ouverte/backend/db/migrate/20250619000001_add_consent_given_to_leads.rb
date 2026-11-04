# db/migrate/20250619000001_add_consent_given_to_leads.rb
class AddConsentGivenToLeads < ActiveRecord::Migration[8.0]
  def change
    add_column :leads, :consent_given, :boolean, default: false, null: false
  end
end
