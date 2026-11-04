// src/types/index.ts
export interface Sector {
  id: number;
  name: string;
  slug: string;
  description?: string;
  city: string;
  position: number;
}

export interface Place {
  id: number;
  name: string;
  slug: string;
  kind: string;
  insee_code?: string;
  parent_id?: number | null;
  position?: number;
  path?: string;
}

export interface PlaceLookup {
  place: Place;
  breadcrumb: Place[];
  children: Place[];
}

export interface Merchant {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook_page_url?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  opening_hours?: Record<string, string>;
  featured: boolean;
  status: string;
  partner_category?: FeedCategory;
  sector: Sector;
  sector_id?: number;
  place?: Place;
  place_id?: number;
  qr_token?: string;
  qr_url?: string;
  qr_scan_count?: number;
  logo_url?: string | null;
  photo_urls?: string[];
  created_at?: string;
  updated_at?: string;
  social_accounts?: MerchantSocialAccount[];
}

export interface MerchantSocialAccount {
  provider: string;
  account_name: string;
  status: string;
  demo: boolean;
  connected: boolean;
}

export interface MerchantInput {
  name: string;
  slug?: string;
  sector_id: number;
  place_id?: number;
  short_description?: string;
  description?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook_page_url?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  status: string;
  featured: boolean;
}

export interface MerchantPhotoAsset {
  signed_id: string;
  url: string;
}

export interface MerchantArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  published_at?: string;
}

export interface StripeConnectStatus {
  connected: boolean;
  account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  ready_for_payouts: boolean;
}

export interface MerchantSubscriptionStatus {
  plan: "merchant";
  status: string | null;
  active: boolean;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  price_label: string;
  features_locked: boolean;
}

export interface MerchantProfile extends Merchant {
  qr_token: string;
  qr_url: string;
  qr_scan_count: number;
  public_url: string;
  logo?: MerchantPhotoAsset | null;
  photos: MerchantPhotoAsset[];
  articles: MerchantArticleSummary[];
  stripe_connect?: StripeConnectStatus;
  subscription?: MerchantSubscriptionStatus;
}

export interface MerchantProfileInput {
  short_description?: string;
  description?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook_page_url?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
}

export interface MerchantDetail extends Merchant {
  articles?: MerchantArticleSummary[];
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  category: string;
  status?: string;
  published_at?: string;
  place?: Place;
  gazette_label?: string;
  territory_label?: string;
  cover_image_url?: string | null;
  author_id?: number;
  merchant_id?: number | null;
  place_id?: number | null;
  author?: { id: number; full_name: string; email: string };
  merchant?: { id: number; name: string; slug: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  category: string;
  status: string;
  published_at?: string;
  merchant_id?: number | null;
  place_id?: number | null;
}

export interface AdminStats {
  merchants: {
    total: number;
    published: number;
    featured: number;
    draft: number;
  };
  articles: {
    total: number;
    published: number;
    draft: number;
    gazette: number;
    immo: number;
  };
  leads: {
    total: number;
    this_month: number;
    by_status: Record<string, number>;
  };
  commissions: {
    total: number;
    total_amount_cents: number;
    payable_cents: number;
    paid_cents: number;
    platform_fee_cents: number;
    conversion_rate: number;
    by_status: Record<string, number>;
  };
  qr_scans: {
    total: number;
    unique: number;
    this_week: number;
    top_merchants: { name: string; scan_count: number }[];
  };
  agency?: {
    name: string;
    subscription: AgencySubscriptionStatus;
  };
}

export interface Lead {
  id: number;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  lead_type: string;
  status: string;
  property_address?: string;
  property_city?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  admin_notes?: string;
  consent_given?: boolean;
  status_events?: LeadStatusEvent[];
  created_at: string;
  merchant: { id: number; name: string; slug: string } | null;
  direct_to_agency?: boolean;
  submitted_by?: { id: number; full_name: string; email: string };
}

export interface LeadInput {
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  lead_type: string;
  property_address?: string;
  property_city?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  consent_given: boolean;
}

export interface ClientLeadInput extends LeadInput {}

export interface LeadStatusEvent {
  id: number;
  from_status: string | null;
  to_status: string;
  note?: string;
  user_name?: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  role: "admin" | "merchant" | "client" | "super_admin";
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  merchant_id?: number | null;
  subscription?: ClientSubscriptionStatus;
  agency?: UserAgency;
}

export interface ClientSubscriptionStatus {
  plan: "client";
  status: string | null;
  active: boolean;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  price_label: string;
  features_locked: boolean;
}

export interface AgencySubscriptionStatus {
  plan: "agency";
  status: string | null;
  active: boolean;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  price_label: string;
  features_locked: boolean;
}

export interface UserAgency {
  id: number;
  name: string;
  slug: string;
  subscription?: AgencySubscriptionStatus;
}

export interface PlatformStats {
  agencies: {
    total: number;
    active: number;
    draft: number;
    subscribed: number;
  };
  clients: {
    total: number;
    subscribed: number;
    this_month: number;
  };
  merchants: {
    total: number;
    published: number;
    subscribed: number;
  };
  leads: {
    total: number;
    this_month: number;
    direct_agency: number;
  };
  visitors: {
    qr_scans_total: number;
    qr_scans_unique: number;
    qr_scans_this_week: number;
  };
  subscriptions: {
    agency_mrr_cents: number;
    client_mrr_cents: number;
    merchant_mrr_cents: number;
  };
  agencies_list: PlatformAgencySummary[];
}

export interface PlatformAgencySummary {
  id: number;
  name: string;
  slug: string;
  city?: string;
  status: string;
  subscription_status?: string | null;
  merchants_count: number;
  clients_count: number;
  leads_count: number;
  created_at: string;
}

export interface BillingInvoice {
  id: string;
  number?: string | null;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  period_end?: string | null;
  created?: string | null;
}

export interface Commission {
  id: number;
  amount_cents: number;
  platform_fee_cents: number;
  merchant_amount_cents: number;
  currency: string;
  status: string;
  approved_at?: string | null;
  paid_at?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_transfer_id?: string | null;
  created_at: string;
  updated_at?: string;
  lead: {
    id: number;
    contact_name: string;
    status: string;
    lead_type: string;
  };
  merchant: {
    id: number;
    name: string;
    slug: string;
    stripe_ready?: boolean;
  } | null;
}

export interface CommissionInput {
  status?: string;
  amount_cents?: number;
  currency?: string;
}

export type FeedCategory = "vie_locale" | "commerces" | "loisirs" | "immo" | "bien_etre";

export type ReviewableType = "Merchant" | "Article" | "Publication";

export interface ReviewReply {
  id: number;
  body: string;
  created_at: string;
  author_name: string;
  author_role: string;
}

export interface Review {
  id: number;
  body: string;
  rating?: number | null;
  created_at: string;
  author_name: string;
  author_id: number;
  author_role: string;
  reply?: ReviewReply | null;
}

export interface ReviewInput {
  reviewable_type: ReviewableType;
  reviewable_slug?: string;
  reviewable_id?: number;
  body: string;
  rating?: number;
}

export interface ReviewReplyInput {
  body: string;
}

export interface PublicationDetail {
  id: number;
  body: string;
  category: FeedCategory;
  published_at: string;
  image_url?: string | null;
  merchant: FeedMerchantSummary;
}

export type ProductCheckoutMode = "one_time" | "promo" | "installment" | "custom";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_cents: number;
  currency: string;
  checkout_mode: ProductCheckoutMode;
  checkout_label: string;
  status: string;
  image_url?: string | null;
  seller_type: "agency" | "merchant";
  platform_fee_cents: number;
  merchant_amount_cents: number;
  merchant?: {
    id: number;
    name: string;
    slug: string;
    logo_url?: string | null;
    stripe_ready?: boolean;
  } | null;
}


export type SocialProvider = "facebook" | "instagram" | "tiktok";

export interface FeedMerchantSummary {
  id: number;
  name: string;
  slug: string;
  partner_category?: FeedCategory;
  logo_url?: string | null;
}

export interface FeedSocialPostSummary {
  provider: SocialProvider;
  status: string;
  published_at?: string;
}

export interface FeedPublicationItem {
  type: "publication";
  id: number;
  body: string;
  category: FeedCategory;
  published_at: string;
  syndicated: boolean;
  image_url?: string | null;
  merchant: FeedMerchantSummary;
  social_posts?: FeedSocialPostSummary[];
}

export interface FeedArticleItem {
  type: "article";
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  category: FeedCategory;
  article_category?: string;
  published_at: string;
  cover_image_url?: string | null;
  merchant?: FeedMerchantSummary | null;
  place?: Place;
}

export type FeedItem = FeedPublicationItem | FeedArticleItem;

export interface Publication {
  id: number;
  body: string;
  category: FeedCategory;
  status: string;
  published_at?: string;
  syndicated: boolean;
  image_url?: string | null;
  created_at: string;
  merchant: FeedMerchantSummary;
  social_posts: {
    id: number;
    provider: SocialProvider;
    status: string;
    external_post_id?: string | null;
    error_message?: string | null;
    published_at?: string | null;
  }[];
}

export interface PublicationInput {
  body: string;
  category?: FeedCategory;
  image?: File;
  syndicate?: boolean;
  providers?: SocialProvider[];
}

export interface SocialAccount {
  id: number;
  provider: SocialProvider;
  account_name: string;
  status: string;
  connected_at?: string;
  demo?: boolean;
}
