# app/services/gazette_label.rb
class GazetteLabel
  def self.for(place)
    return nil unless place

    new(place).label
  end

  def self.territory_path(place)
    return nil unless place

    place.breadcrumb.drop(1).map(&:slug).join("/")
  end

  def self.territory_label(place)
    return nil unless place

    place.breadcrumb.drop(1).map(&:name).join(" · ")
  end

  def initialize(place)
    @place = place
  end

  def label
    "Gazette · #{@place.name}"
  end
end
