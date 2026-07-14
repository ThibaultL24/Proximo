# app/services/platform_stats_builder.rb
class PlatformStatsBuilder
  def self.call
    new.call
  end

  def call
    week_start = 7.days.ago
    month_start = Time.current.beginning_of_month

    {
      agencies: agency_stats,
      clients: client_stats,
      merchants: merchant_stats,
      leads: lead_stats(month_start),
      visitors: visitor_stats(week_start),
      subscriptions: subscription_stats,
      agencies_list: agencies_overview
    }
  end

  private

  def agency_stats
    agencies = Agency.all
    {
      total: agencies.count,
      active: agencies.where(status: :active).count,
      draft: agencies.where(status: :draft).count,
      subscribed: agencies.where(subscription_status: %w[trialing active]).count
    }
  end

  def client_stats
    clients = User.client
    {
      total: clients.count,
      subscribed: clients.where(subscription_status: %w[trialing active]).count,
      this_month: clients.where(created_at: Time.current.beginning_of_month..).count
    }
  end

  def merchant_stats
    {
      total: Merchant.count,
      published: Merchant.published.count,
      subscribed: Merchant.where(subscription_status: %w[trialing active]).count
    }
  end

  def lead_stats(month_start)
    {
      total: Lead.count,
      this_month: Lead.where(created_at: month_start..).count,
      direct_agency: Lead.where(merchant_id: nil).count
    }
  end

  def visitor_stats(week_start)
    scans = QrScan.all
    {
      qr_scans_total: scans.count,
      qr_scans_unique: scans.where.not(session_id: [nil, ""]).distinct.count(:session_id),
      qr_scans_this_week: scans.where(created_at: week_start..).count
    }
  end

  def subscription_stats
    {
      agency_mrr_cents: Agency.where(subscription_status: %w[trialing active]).count * 12_500,
      client_mrr_cents: User.client.where(subscription_status: %w[trialing active]).count * 200,
      merchant_mrr_cents: Merchant.where(subscription_status: %w[trialing active]).count * 1200
    }
  end

  def agencies_overview
    Agency.order(created_at: :desc).limit(20).map do |agency|
      {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        city: agency.city,
        status: agency.status,
        subscription_status: agency.subscription_status,
        merchants_count: agency.merchants.count,
        clients_count: User.client.where(agency_id: agency.id).count,
        leads_count: agency.leads.count,
        created_at: agency.created_at
      }
    end
  end
end
