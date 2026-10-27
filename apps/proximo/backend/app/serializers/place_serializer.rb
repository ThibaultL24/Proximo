# app/serializers/place_serializer.rb
class PlaceSerializer < AlbaResource
  attributes :id, :name, :slug, :kind, :insee_code, :parent_id, :position

  attribute :path do |place|
    segments = place.breadcrumb.drop(1).map(&:slug)
    segments.join("/")
  end
end
