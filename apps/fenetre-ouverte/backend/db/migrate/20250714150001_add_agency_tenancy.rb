# db/migrate/20250714150001_add_agency_tenancy.rb
class AddAgencyTenancy < ActiveRecord::Migration[8.0]
  def up
    add_reference :users, :agency, foreign_key: true
    add_reference :merchants, :agency, foreign_key: true
    add_reference :sectors, :agency, foreign_key: true
    add_reference :articles, :agency, foreign_key: true
    add_reference :leads, :agency, foreign_key: true

    agency = Agency.create!(
      name: "Code Immo",
      slug: "code-immo",
      city: "Montpellier",
      status: :active,
      subscription_status: "active"
    )

    Merchant.unscoped.update_all(agency_id: agency.id)
    Sector.unscoped.update_all(agency_id: agency.id)
    Article.unscoped.update_all(agency_id: agency.id)
    Lead.unscoped.update_all(agency_id: agency.id)
    User.unscoped.where(role: User.roles[:admin]).update_all(agency_id: agency.id)
    User.unscoped.where(role: User.roles[:client]).update_all(agency_id: agency.id)

    change_column_null :merchants, :agency_id, false
    change_column_null :sectors, :agency_id, false
    change_column_null :articles, :agency_id, false
    change_column_null :leads, :agency_id, false

    remove_index :sectors, :slug
    add_index :sectors, [:agency_id, :slug], unique: true

    remove_index :merchants, :slug
    add_index :merchants, [:agency_id, :slug], unique: true

    remove_index :articles, :slug
    add_index :articles, [:agency_id, :slug], unique: true
  end

  def down
    remove_index :articles, [:agency_id, :slug]
    add_index :articles, :slug, unique: true
    remove_index :merchants, [:agency_id, :slug]
    add_index :merchants, :slug, unique: true
    remove_index :sectors, [:agency_id, :slug]
    add_index :sectors, :slug, unique: true

    remove_reference :leads, :agency, foreign_key: true
    remove_reference :articles, :agency, foreign_key: true
    remove_reference :sectors, :agency, foreign_key: true
    remove_reference :merchants, :agency, foreign_key: true
    remove_reference :users, :agency, foreign_key: true
    drop_table :agencies
  end
end
