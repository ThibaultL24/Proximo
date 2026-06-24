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
  opening_hours?: Record<string, string>;
  featured: boolean;
  status: string;
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

export interface MerchantProfile extends Merchant {
  qr_token: string;
  qr_url: string;
  qr_scan_count: number;
  public_url: string;
  logo?: MerchantPhotoAsset | null;
  photos: MerchantPhotoAsset[];
  articles: MerchantArticleSummary[];
  stripe_connect?: StripeConnectStatus;
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
    by_status: Record<string, number>;
  };
  qr_scans: {
    total: number;
    unique: number;
    this_week: number;
    top_merchants: { name: string; scan_count: number }[];
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
  merchant: { id: number; name: string; slug: string };
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
  role: "admin" | "merchant";
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface Commission {
  id: number;
  amount_cents: number;
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
  };
}

export interface CommissionInput {
  status?: string;
  amount_cents?: number;
  currency?: string;
}
