# app/services/admin_stats_builder.rb
class AdminStatsBuilder
  def self.call
    new.call
  end

  def call
    week_start = 7.days.ago
    month_start = Time.current.beginning_of_month

    {
      merchants: merchant_stats,
      articles: article_stats,
      leads: lead_stats(month_start),
      commissions: commission_stats,
      qr_scans: qr_scan_stats(week_start)
    }
  end

  private

  def merchant_stats
    published = Merchant.published
    {
      total: Merchant.count,
      published: published.count,
      featured: published.where(featured: true).count,
      draft: Merchant.where(status: :draft).count
    }
  end

  def article_stats
    published = Article.published
    {
      total: Article.count,
      published: published.count,
      draft: Article.where(status: :draft).count,
      gazette: published.where(category: Article::GAZETTE_CATEGORIES).count,
      immo: published.where(category: Article::IMMO_CATEGORIES).count
    }
  end

  def lead_stats(month_start)
    leads = Lead.all
    {
      total: leads.count,
      this_month: leads.where(created_at: month_start..).count,
      by_status: Lead.statuses.keys.index_with { |status| leads.where(status: status).count }
    }
  end

  def commission_stats
    commissions = Commission.all
    {
      total: commissions.count,
      total_amount_cents: commissions.where.not(status: :cancelled).sum(:amount_cents),
      by_status: Commission.statuses.keys.index_with { |status| commissions.where(status: status).count }
    }
  end

  def qr_scan_stats(week_start)
    scans = QrScan.all
    top_merchants = Merchant.published
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
end
