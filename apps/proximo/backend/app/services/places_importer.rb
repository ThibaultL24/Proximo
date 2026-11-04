# app/services/places_importer.rb
require "net/http"
require "json"

class PlacesImporter
  GEO_API = "https://geo.api.gouv.fr".freeze

  def self.call
    new.call
  end

  def call
    france = Place.find_or_initialize_by(kind: :country, insee_code: "FRA")
    france.assign_attributes(
      name: "France",
      slug: "france",
      kind: :country,
      parent_id: nil,
      position: 0
    )
    france.save!

    import_regions(france)
    import_departments
    france
  end

  private

  def import_regions(france)
    fetch("/regions").each_with_index do |row, index|
      place = Place.find_or_initialize_by(kind: :region, insee_code: row["code"])
      place.assign_attributes(
        parent: france,
        name: row["nom"],
        slug: slug_for(row["nom"]),
        kind: :region,
        position: index
      )
      place.save!
    end
  end

  def import_departments
    fetch("/departements").each_with_index do |row, index|
      region = Place.regions.find_by(insee_code: row["codeRegion"])
      next unless region

      place = Place.find_or_initialize_by(kind: :department, insee_code: row["code"])
      place.assign_attributes(
        parent: region,
        name: row["nom"],
        slug: slug_for(row["nom"]),
        kind: :department,
        position: index
      )
      place.save!
    end
  end

  def fetch(path)
    uri = URI("#{GEO_API}#{path}")
    response = Net::HTTP.get_response(uri)
    raise "Geo API error #{response.code} for #{path}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end

  def slug_for(name)
    name.parameterize
  end
end
