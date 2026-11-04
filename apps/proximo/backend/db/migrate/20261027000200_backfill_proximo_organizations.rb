# Backfills legacy data on an isolated Proximo database copy.
# The migration is self-contained and never mutates the historical monolith.
class BackfillProximoOrganizations < ActiveRecord::Migration[8.0]
  def up
    add_reference :organizations, :legacy_agency, index: { unique: true }, foreign_key: { to_table: :agencies }
    add_reference :partners, :legacy_merchant, index: { unique: true }, foreign_key: { to_table: :merchants }
    add_reference :leads, :organization, foreign_key: true
    add_reference :leads, :partner, foreign_key: true
    change_column_null :leads, :agency_id, true

    backfill_legacy_data!
  end

  def down
    # Refuse rollback that would silently discard leads created without a legacy agency.
    if select_value("SELECT COUNT(*) FROM leads WHERE agency_id IS NULL").to_i.positive?
      raise ActiveRecord::IrreversibleMigration, "Proximo-only leads must be exported before rollback"
    end

    change_column_null :leads, :agency_id, false
    remove_reference :leads, :partner, foreign_key: true
    remove_reference :leads, :organization, foreign_key: true
    remove_reference :partners, :legacy_merchant, foreign_key: { to_table: :merchants }
    remove_reference :organizations, :legacy_agency, foreign_key: { to_table: :agencies }
  end

  # Public for repeatable migration checks on freshly imported legacy snapshots.
  def backfill_legacy_data!
    execute <<~SQL
      INSERT INTO organizations (name, slug, status, legacy_agency_id, created_at, updated_at)
      SELECT a.name, a.slug, a.status, a.id, a.created_at, a.updated_at
      FROM agencies a
      ON CONFLICT (legacy_agency_id) DO NOTHING
    SQL

    # Legacy agency admins are the initial organization owners. Ordinary
    # customers do not gain permission to browse the organization's leads.
    execute <<~SQL
      INSERT INTO memberships (organization_id, user_id, role, created_at, updated_at)
      SELECT o.id, u.id, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM users u
      INNER JOIN organizations o ON o.legacy_agency_id = u.agency_id
      WHERE u.role = 1
      ON CONFLICT (organization_id, user_id) DO NOTHING
    SQL

    execute <<~SQL
      INSERT INTO partners (organization_id, name, slug, status,
                            contact_email, contact_phone, legacy_merchant_id,
                            created_at, updated_at)
      SELECT o.id, m.name, m.slug, m.status, m.email, m.phone, m.id,
             m.created_at, m.updated_at
      FROM merchants m
      INNER JOIN organizations o ON o.legacy_agency_id = m.agency_id
      ON CONFLICT (legacy_merchant_id) DO NOTHING
    SQL

    execute <<~SQL
      UPDATE leads
      SET organization_id = organizations.id
      FROM organizations
      WHERE leads.organization_id IS NULL
        AND organizations.legacy_agency_id = leads.agency_id
    SQL

    execute <<~SQL
      UPDATE leads
      SET partner_id = partners.id
      FROM partners
      WHERE leads.partner_id IS NULL
        AND partners.legacy_merchant_id = leads.merchant_id
        AND partners.organization_id = leads.organization_id
    SQL
  end
end
