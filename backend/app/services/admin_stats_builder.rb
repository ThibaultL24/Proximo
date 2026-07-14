# app/services/admin_stats_builder.rb
class AdminStatsBuilder
  def self.call(agency:)
    new(agency).call
  end

  def initialize(agency)
    @agency = agency
  end

  def call
    week_start = 7.days.ago
    month_start = Time.current.beginning_of_month

    {
      merchants: merchant_stats,
      articles: article_stats,
      leads: lead_stats(month_start),
      commissions: commission_stats,
      qr_scans: qr_scan_stats(week_start),
      agency: agency_summary
    }
  end

  private

  attr_reader :agency

  def merchant_stats
    merchants = agency.merchants
    published = merchants.published
    {
      total: merchants.count,
      published: published.count,
      featured: published.where(featured: true).count,
      draft: merchants.where(status: :draft).count
    }
  end

  def article_stats
    articles = agency.articles
    published = articles.published
    {
      total: articles.count,
      published: published.count,
      draft: articles.where(status: :draft).count,
      gazette: published.where(category: Article::GAZETTE_CATEGORIES).count,
      immo: published.where(category: Article::IMMO_CATEGORIES).count
    }
  end

  def lead_stats(month_start)
    leads = agency.leads
    {
      total: leads.count,
      this_month: leads.where(created_at: month_start..).count,
      by_status: Lead.statuses.keys.index_with { |status| leads.where(status: status).count }
    }
  end

  def commission_stats
    commissions = Commission.joins(:lead).where(leads: { agency_id: agency.id })
    {
      total: commissions.count,
      total_amount_cents: commissions.where.not(status: :cancelled).sum(:amount_cents),
      by_status: Commission.statuses.keys.index_with { |status| commissions.where(status: status).count }
    }
  end

  def qr_scan_stats(week_start)
    scans = QrScan.joins(:merchant).where(merchants: { agency_id: agency.id })
    top_merchants = agency.merchants.published
                          .left_joins(:qr_scans)
                          .group("merchants.id", "merchants.name")
                          .order(Arel.sql("COUNT(qr_scans.id) DESC"))
                          .limit(5)
                          .pluck("merchants.name", Arel.sql("COUNT(qr_scans.id)"))

    {
      total: scans.count,
      unique: scans.where.not(session_id: [nil, ""]).distinct.count(:session_id),
      this_week: scans.where(created_at: week_start..).count,
      top_merchants: top_merchants.map { |name, count| { name: name, scan_count: count } }
    }
  end

  def agency_summary
    {
      name: agency.name,
      subscription: AgencySubscriptionService.for(agency).status
    }
  end
end
