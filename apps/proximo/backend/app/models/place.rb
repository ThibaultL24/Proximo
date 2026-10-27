# app/models/place.rb
class Place < ApplicationRecord
  belongs_to :parent, class_name: "Place", optional: true
  has_many :children, class_name: "Place", foreign_key: :parent_id, dependent: :destroy
  has_many :merchants, dependent: :restrict_with_error
  has_many :articles, dependent: :nullify

  enum :kind, {
    country: 0,
    region: 1,
    department: 2,
    city: 3,
    district: 4
  }

  validates :name, :slug, :kind, presence: true
  validates :slug, uniqueness: { scope: :parent_id }
  validates :insee_code, uniqueness: { scope: :kind }, allow_nil: true

  scope :ordered, -> { order(:position, :name) }
  scope :regions, -> { where(kind: :region) }
  scope :departments, -> { where(kind: :department) }

  def self.country_root
    find_by!(kind: :country, slug: "france")
  end

  def self.find_by_path!(slugs)
    slugs = Array(slugs).compact_blank
    return country_root if slugs.empty?

    current = country_root
    slugs.each do |slug|
      current = current.children.find_by!(slug: slug)
    end
    current
  end

  def breadcrumb
    trail = []
    node = self
    while node
      trail.unshift(node)
      node = node.parent
    end
    trail
  end

  def descendant_ids
    self.class.descendant_ids_for(id)
  end

  def self.descendant_ids_for(place_id)
    if connection.adapter_name.match?(/sqlite/i)
      sql = <<~SQL.squish
        WITH RECURSIVE descendants AS (
          SELECT id FROM places WHERE id = #{place_id.to_i}
          UNION ALL
          SELECT places.id FROM places
          INNER JOIN descendants ON places.parent_id = descendants.id
        )
        SELECT id FROM descendants
      SQL
      connection.select_values(sql).map(&:to_i)
    else
      sql = <<~SQL.squish
        WITH RECURSIVE descendants AS (
          SELECT id FROM places WHERE id = ?
          UNION ALL
          SELECT places.id FROM places
          INNER JOIN descendants ON places.parent_id = descendants.id
        )
        SELECT id FROM descendants
      SQL
      connection.select_values(sanitize_sql_array([sql, place_id])).map(&:to_i)
    end
  end

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
