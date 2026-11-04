namespace :territories do
  desc "Backfill legacy Fenetre Ouverte agency data on the isolated destination database"
  task backfill_legacy: :environment do
    abort "Set FO_CONFIRM_LEGACY_BACKFILL=1" unless ENV["FO_CONFIRM_LEGACY_BACKFILL"] == "1"

    require Rails.root.join("db/migrate/20261028000200_backfill_territories").to_s
    BackfillTerritories.new.backfill!
    puts "Territorial references synchronized"
  end
end
