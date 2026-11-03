class GazetteEdition < ApplicationRecord
  belongs_to :agency
  has_many_attached :media_assets

  enum :status, { draft: 0, published: 1, archived: 2 }

  TEMPLATES = %w[portrait pratique reportage couverture agenda photo].freeze
  SETTINGS = %w[subtitle territory banner contact legal].freeze

  validates :issue_label, :edition_label, presence: true
  validates :issue_label, uniqueness: { scope: :agency_id }
  validates :pages, presence: true
  validate :validate_pages
  validate :validate_settings
  validate :validate_assets_manifest
  validate :preserve_published_snapshot, on: :update

  def publish!
    with_lock do
      raise ActiveRecord::RecordInvalid, self unless draft?

      snapshots = pages.map do |page|
        article = agency.articles.gazette.find_by(id: page["articleId"])
        unless article
          errors.add(:pages, "contiennent un article manquant ou hors du territoire")
          raise ActiveRecord::RecordInvalid, self
        end

        cover_blob_id = article.cover_image.blob&.id
        if cover_blob_id && !media_assets.attachments.exists?(blob_id: cover_blob_id)
          media_assets.attach(article.cover_image.blob)
        end

        page.merge(
          "article_snapshot" => {
            "id" => article.id,
            "title" => article.title,
            "excerpt" => article.excerpt,
            "body" => article.body,
            # Ne garantit pas la persistance des médias : à consolider
            # avant l'impression d'un numéro définitif.
            "cover_blob_id" => cover_blob_id
          }
        )
      end

      update!(pages: snapshots, status: :published, published_at: Time.current)
    end
    self
  end

  def archive!
    with_lock do
      raise ActiveRecord::RecordInvalid, self unless published?
      update!(status: :archived)
    end
    self
  end

  def asset_urls
    by_blob_id = media_assets.attachments.includes(:blob).index_by(&:blob_id)
    assets_manifest.transform_values do |blob_id|
      AttachmentUrls.blob_path(by_blob_id[blob_id.to_i])
    end
  end

  def printable_pages
    by_blob_id = media_assets.attachments.includes(:blob).index_by(&:blob_id)
    pages.map do |page|
      snapshot = page["article_snapshot"]
      next page unless snapshot.is_a?(Hash)

      attachment = by_blob_id[snapshot["cover_blob_id"].to_i]
      page.merge("article_snapshot" => snapshot.merge(
        "cover_image_url" => AttachmentUrls.blob_path(attachment)
      ))
    end
  end

  private

  def validate_assets_manifest
    valid = assets_manifest.is_a?(Hash) && assets_manifest.all? do |key, blob_id|
      (key.in?(%w[headerLogo footerLogo]) ||
        key.match?(/\A(?:extraImage|qrImage):[1-9]\d*\z/)) &&
        blob_id.to_s.match?(/\A[1-9]\d*\z/)
    end
    errors.add(:assets_manifest, "contient des références invalides") unless valid
  end

  def validate_pages
    unless pages.is_a?(Array) && pages.length.between?(1, 40)
      errors.add(:pages, "doivent contenir entre 1 et 40 pages")
      return
    end

    pages.each_with_index do |page, index|
      unless page.is_a?(Hash) && TEMPLATES.include?(page["template"])
        errors.add(:pages, "ont un gabarit invalide à la page #{index + 1}")
        next
      end

      id = page["articleId"]
      next if id.blank?

      unless id.to_s.match?(/\A[1-9]\d*\z/) && agency&.articles&.gazette&.exists?(id: id)
        errors.add(:pages, "référencent un article non autorisé à la page #{index + 1}")
      end
    end
  end

  def validate_settings
    unless settings.is_a?(Hash) && (settings.keys - SETTINGS).empty? &&
           settings.values.all? { |value| value.is_a?(String) && value.length <= 500 }
      errors.add(:settings, "contiennent des champs non autorisés")
    end
  end

  def preserve_published_snapshot
    old_status = status_in_database
    return unless %w[published archived].include?(old_status)

    allowed = old_status == "published" && status == "archived" &&
              (changes_to_save.keys - %w[status updated_at lock_version]).empty?

    errors.add(:base, "une édition publiée est immuable") unless allowed
  end
end
