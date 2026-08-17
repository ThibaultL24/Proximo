# app/services/feed_builder.rb
class FeedBuilder
  include AttachmentUrls
  FEED_CATEGORIES = Publication.categories.keys.freeze

  ARTICLE_CATEGORY_MAP = {
    "local_news" => "vie_locale",
    "merchant_spotlight" => "commerces",
    "real_estate" => "immo",
    "agency_news" => "immo"
  }.freeze

  def self.call(agency:, category: nil, place_path: nil, limit: 30)
    new(agency:, category:, place_path:, limit:).call
  end

  def initialize(agency:, category: nil, place_path: nil, limit: 30)
    @agency = agency
    @category = category.presence
    @place_path = place_path.presence
    @limit = limit
  end

  def call
    items = publication_items + article_items
    items.sort_by { |item| item[:published_at] || Time.at(0) }.reverse.first(@limit)
  end

  private

  attr_reader :agency, :category, :place_path, :limit

  def publication_items
    scope = Publication.published.includes(:merchant, image_attachment: :blob).where(agency_id: agency.id)
    scope = scope.where(category: category) if category.present? && FEED_CATEGORIES.include?(category)
    scope = filter_publications_by_place(scope) if place_path.present?

    scope.recent.limit(limit).map { |publication| serialize_publication(publication) }
  end

  def article_items
    scope = Article.published.includes(:merchant, :place).where(agency_id: agency.id)
    scope = filter_articles_by_category(scope)
    scope = filter_articles_by_place(scope) if place_path.present?

    scope.order(published_at: :desc).limit(limit).map { |article| serialize_article(article) }
  end

  def filter_articles_by_category(scope)
    return scope unless category.present?

    mapped = ARTICLE_CATEGORY_MAP.select { |_k, v| v == category }.keys
    return scope.none if mapped.empty?

    scope.where(category: mapped)
  end

  def filter_publications_by_place(scope)
    place = Place.find_by_path!(place_path.split("/"))
    ids = place.descendant_ids
    scope.joins(:merchant).where(merchants: { place_id: ids })
  end

  def filter_articles_by_place(articles)
    place = Place.find_by_path!(place_path.split("/"))
    ids = place.descendant_ids

    articles.left_joins(:merchant).where(
      "articles.place_id IN (:ids) OR merchants.place_id IN (:ids)",
      ids: ids
    )
  end

  def serialize_publication(publication)
    {
      type: "publication",
      id: publication.id,
      body: publication.body,
      category: publication.category,
      published_at: publication.published_at || publication.created_at,
      syndicated: publication.syndicated,
      image_url: blob_path(publication.image),
      merchant: merchant_summary(publication.merchant),
      social_posts: publication.social_posts.map { |post| social_post_summary(post) }
    }
  end

  def serialize_article(article)
    {
      type: "article",
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      category: ARTICLE_CATEGORY_MAP.fetch(article.category, "vie_locale"),
      article_category: article.category,
      published_at: article.published_at || article.created_at,
      merchant: article.merchant ? merchant_summary(article.merchant) : nil,
      place: article.place ? PlaceSerializer.new(article.place).serializable_hash : nil
    }
  end

  def merchant_summary(merchant)
    {
      id: merchant.id,
      name: merchant.name,
      slug: merchant.slug,
      partner_category: merchant.partner_category,
      logo_url: blob_path(merchant.logo)
    }
  end

  def social_post_summary(post)
    {
      provider: post.provider,
      status: post.status,
      published_at: post.published_at
    }
  end
end
