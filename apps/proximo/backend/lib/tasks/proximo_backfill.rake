namespace :proximo do
  desc "Backfill legacy Agency/Merchant records after importing an isolated legacy snapshot"
  task backfill_legacy: :environment do
    unless ENV["PROXIMO_CONFIRM_LEGACY_BACKFILL"] == "1"
      abort "Set PROXIMO_CONFIRM_LEGACY_BACKFILL=1 after checking the destination database"
    end

    require Rails.root.join("db/migrate/20261027000200_backfill_proximo_organizations").to_s
    BackfillProximoOrganizations.new.backfill_legacy_data!
    puts "Legacy Proximo organization and partner references synchronized"
  end
end
