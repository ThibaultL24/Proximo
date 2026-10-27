# Execute only in Fenetre Ouverte's own PostgreSQL database.
# Does not call into the separate Proximo database.
class BackfillTerritories < ActiveRecord::Migration[8.0]
  def up
    backfill!
  end

  def down
    # Keep original historical foreign keys on the legacy models.
    execute "UPDATE publications SET territory_id = NULL"
    execute "UPDATE articles SET territory_id = NULL"
    execute "UPDATE merchants SET territory_id = NULL"
    execute "UPDATE sectors SET territory_id = NULL"
    execute "DELETE FROM territory_memberships"
    execute "DELETE FROM territories WHERE legacy_agency_id IS NOT NULL"
  end

  def backfill!
    execute <<~SQL
      INSERT INTO territories (name, slug, status, legacy_agency_id, created_at, updated_at)
      SELECT name, slug, status, id, created_at, updated_at FROM agencies
      ON CONFLICT (legacy_agency_id) DO NOTHING
    SQL

    execute <<~SQL
      INSERT INTO territory_memberships (territory_id, user_id, role, created_at, updated_at)
      SELECT t.id, u.id, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM users u
      JOIN territories t ON t.legacy_agency_id = u.agency_id
      WHERE u.role = 1
      ON CONFLICT (territory_id, user_id) DO NOTHING
    SQL

    %w[sectors merchants articles publications].each do |table|
      execute <<~SQL
        UPDATE #{table}
        SET territory_id = territories.id
        FROM territories
        WHERE #{table}.territory_id IS NULL
          AND #{table}.agency_id = territories.legacy_agency_id
      SQL
    end
  end
end
