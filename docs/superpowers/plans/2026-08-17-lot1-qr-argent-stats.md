# Lot 1 — QR, commissions, agenda, stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make QR counters, commission split, billing invoices, and agency stats demo-credible.

**Architecture:** Counter cache on `qr_scans`; `CommissionQuote` computes amount + platform fee; Checkout destination charge with `application_fee_amount`; Stripe Invoice list on billing endpoints; `AdminStatsBuilder` exposes payable/paid/conversion.

**Tech Stack:** Rails 8 API, Minitest, Stripe Checkout/Invoices, React + TypeScript.

## Global Constraints

- Palette papier / encre / tuile, no Nestenn/Green-Acres copy.
- Citoyen 2 €, commerçant 12 €, agence 125 €.
- Destination charges + `application_fee_amount`.
- No `payment_method_types` in Stripe calls.
- Secrets never in merchant profile.
- Lots 2–5 (home, avis, boutique, réseaux, seed enrichie) are **out of this plan**.

## File map

- Create: `backend/test/test_helper.rb`, `backend/test/services/qr_scan_recorder_test.rb`, `backend/test/services/commission_quote_test.rb`
- Create: `backend/app/services/commission_quote.rb`, `backend/app/services/stripe_invoice_list.rb`
- Create: `backend/db/migrate/20260817200000_add_platform_fee_to_commissions.rb`
- Modify: `qr_scan.rb`, serializers, `commission_creator.rb`, `commission_stripe_checkout_service.rb`, `commission.rb`, billing controllers, `admin_stats_builder.rb`, commission/analytics UI, subscription 12 € copy
- Create: `frontend/src/components/billing/billing-invoice-list.tsx`

---

### Task 1: QR counter cache

**Files:**
- Modify: `backend/app/models/qr_scan.rb`
- Modify: `backend/app/serializers/merchant_profile_serializer.rb`
- Modify: `backend/app/serializers/admin_merchant_serializer.rb`
- Test: `backend/test/services/qr_scan_recorder_test.rb`

**Interfaces:**
- Consumes: `QrScanRecorder.record!`
- Produces: `merchant.qr_scan_count` equals `merchant.qr_scans.count` after each scan

- [ ] **Step 1: Test helper + failing test**
- [ ] **Step 2: `belongs_to :merchant, counter_cache: :qr_scan_count`**
- [ ] **Step 3: Reset counters in recorder after create (heal stale column)**
- [ ] **Step 4: Serializers keep using `qr_scan_count` (now correct)**

---

### Task 2: Commission quote + split

**Files:**
- Create: `backend/app/services/commission_quote.rb`
- Modify: `backend/app/services/commission_creator.rb`
- Modify: `backend/app/models/commission.rb`
- Migration: `platform_fee_cents`
- Test: `backend/test/services/commission_quote_test.rb`

**Interfaces:**
- Produces: `CommissionQuote.for(lead) => { amount_cents:, platform_fee_cents:, merchant_amount_cents:, currency:, label: }`
- Barème: buy = 1 % du budget max (min 50 €, max 300 €) else forfait sell 150 € / rent 80 € / other 50 €
- Platform fee = 10 % (`PLATFORM_FEE_BPS = 1000`)

---

### Task 3: Checkout with application_fee_amount

**Files:**
- Modify: `backend/app/services/commission_stripe_checkout_service.rb`
- Modify: `backend/app/serializers/commission_serializer.rb`

`payment_intent_data.application_fee_amount` = `commission.platform_fee_cents`  
`transfer_data.destination` unchanged.  
Line item `unit_amount` = `commission.amount_cents` (total agence).

---

### Task 4: Invoice agenda

**Files:**
- Create: `backend/app/services/stripe_invoice_list.rb`
- Modify: billing controllers + routes `get :invoices`
- Create: `frontend/src/components/billing/billing-invoice-list.tsx`

List last 12 Stripe invoices for the customer; empty array if no customer / Stripe error.

---

### Task 5: Stats + 12 € copy + commission UI

**Files:**
- Modify: `admin_stats_builder.rb`, analytics page, commissions page (split + amount field, no prompt)
- Modify: `merchant_subscription_service.rb` price_label `12 € / mois`
- Modify: merchant-subscription-card copy

---
