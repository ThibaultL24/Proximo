# app/serializers/sector_serializer.rb
class SectorSerializer < AlbaResource
  attributes :id, :name, :slug, :description, :city, :position
end
