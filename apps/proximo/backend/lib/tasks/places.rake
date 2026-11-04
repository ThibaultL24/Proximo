# lib/tasks/places.rake
namespace :places do
  desc "Import French regions and departments from geo.api.gouv.fr"
  task import: :environment do
    france = PlacesImporter.call
    puts "Places OK: #{Place.count} entries (#{Place.regions.count} regions, #{Place.departments.count} departments)"
  end
end
