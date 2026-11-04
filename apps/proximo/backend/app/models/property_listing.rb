# Dossier de publicité immobilière, distinct d'une fiche client et d'un lead.
# 'ready' signifie prêt à être contrôlé/exporté, PAS publié chez un portail.
class PropertyListing < ApplicationRecord
  belongs_to :organization
  belongs_to :created_by, class_name: "User"
  has_many_attached :photos

  enum :transaction_type, { sale: 0, rental: 1 }
  enum :status, { draft: 0, ready: 1, archived: 2 }

  KINDS = %w[appartement maison terrain immeuble local_commercial autre].freeze
  ENERGY_CLASSES = %w[A B C D E F G non_soumis].freeze

  validates :title, presence: true, length: { maximum: 140 }
  validates :description, presence: true, length: { maximum: 8_000 }
  validates :city, presence: true, length: { maximum: 120 }
  validates :property_kind, inclusion: { in: KINDS }
  validates :postal_code, format: { with: /\A\d{5}\z/ }, allow_blank: true
  validates :price_cents, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :area_sqm, numericality: { greater_than: 0 }, allow_nil: true
  validates :rooms, :bedrooms, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :energy_class, :ghg_class, inclusion: { in: ENERGY_CLASSES }, allow_blank: true
  validate :required_for_ready

  def prepare!
    update!(status: :ready, prepared_at: Time.current)
  end

  def public_export
    {
      reference: id, title: title, description: description,
      transaction: transaction_type, property_kind: property_kind,
      city: city, postal_code: postal_code, price_eur: price_cents && price_cents / 100.0,
      area_sqm: area_sqm&.to_s, rooms: rooms, bedrooms: bedrooms,
      mandate_reference: mandate_reference, energy_class: energy_class, ghg_class: ghg_class
    }
  end

  private

  def required_for_ready
    return unless ready?

    {
      mandate_reference: mandate_reference,
      price_cents: price_cents,
      area_sqm: area_sqm,
      postal_code: postal_code
    }.each do |key, value|
      errors.add(key, "doit être renseigné avant la préparation de diffusion") if value.blank?
    end
  end
end
