# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_06_18_231253) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "articles", force: :cascade do |t|
    t.integer "author_id", null: false
    t.integer "merchant_id"
    t.string "title", null: false
    t.string "slug", null: false
    t.text "excerpt"
    t.text "body"
    t.integer "category", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "place_id"
    t.index ["author_id"], name: "index_articles_on_author_id"
    t.index ["merchant_id"], name: "index_articles_on_merchant_id"
    t.index ["place_id"], name: "index_articles_on_place_id"
    t.index ["slug"], name: "index_articles_on_slug", unique: true
    t.index ["status"], name: "index_articles_on_status"
  end

  create_table "commissions", force: :cascade do |t|
    t.integer "lead_id", null: false
    t.integer "amount_cents", null: false
    t.string "currency", default: "EUR", null: false
    t.integer "status", default: 0, null: false
    t.string "stripe_account_id"
    t.string "stripe_transfer_id"
    t.datetime "approved_at"
    t.datetime "paid_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["lead_id"], name: "index_commissions_on_lead_id", unique: true
  end

  create_table "lead_status_events", force: :cascade do |t|
    t.integer "lead_id", null: false
    t.integer "user_id"
    t.string "from_status"
    t.string "to_status", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["lead_id"], name: "index_lead_status_events_on_lead_id"
    t.index ["user_id"], name: "index_lead_status_events_on_user_id"
  end

  create_table "leads", force: :cascade do |t|
    t.integer "merchant_id", null: false
    t.integer "submitted_by_id", null: false
    t.string "contact_name", null: false
    t.string "contact_email"
    t.string "contact_phone", null: false
    t.integer "lead_type", default: 0, null: false
    t.string "property_address"
    t.string "property_city"
    t.text "description"
    t.integer "budget_min"
    t.integer "budget_max"
    t.integer "status", default: 0, null: false
    t.text "admin_notes"
    t.datetime "qualified_at"
    t.datetime "converted_at"
    t.datetime "rejected_at"
    t.string "rejection_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "consent_given", default: false, null: false
    t.index ["merchant_id"], name: "index_leads_on_merchant_id"
    t.index ["status"], name: "index_leads_on_status"
    t.index ["submitted_by_id"], name: "index_leads_on_submitted_by_id"
  end

  create_table "merchants", force: :cascade do |t|
    t.integer "sector_id", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.string "short_description"
    t.text "description"
    t.string "address"
    t.string "postal_code"
    t.string "city"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "phone"
    t.string "email"
    t.string "website"
    t.json "opening_hours", default: {}
    t.integer "status", default: 0, null: false
    t.boolean "featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "qr_token", null: false
    t.integer "qr_scan_count", default: 0, null: false
    t.integer "place_id"
    t.index ["place_id"], name: "index_merchants_on_place_id"
    t.index ["qr_token"], name: "index_merchants_on_qr_token", unique: true
    t.index ["sector_id"], name: "index_merchants_on_sector_id"
    t.index ["slug"], name: "index_merchants_on_slug", unique: true
    t.index ["status"], name: "index_merchants_on_status"
  end

  create_table "places", force: :cascade do |t|
    t.integer "parent_id"
    t.string "name", null: false
    t.string "slug", null: false
    t.integer "kind", default: 0, null: false
    t.string "insee_code"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kind", "insee_code"], name: "index_places_on_kind_and_insee_code", unique: true
    t.index ["kind"], name: "index_places_on_kind"
    t.index ["parent_id", "slug"], name: "index_places_on_parent_id_and_slug", unique: true
    t.index ["parent_id"], name: "index_places_on_parent_id"
  end

  create_table "qr_scans", force: :cascade do |t|
    t.integer "merchant_id", null: false
    t.string "session_id"
    t.string "ip_hash"
    t.string "user_agent"
    t.string "referer"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_qr_scans_on_created_at"
    t.index ["merchant_id", "session_id"], name: "index_qr_scans_on_merchant_id_and_session_id"
    t.index ["merchant_id"], name: "index_qr_scans_on_merchant_id"
  end

  create_table "sectors", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "city", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_sectors_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 0, null: false
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.integer "merchant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["merchant_id"], name: "index_users_on_merchant_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "articles", "merchants"
  add_foreign_key "articles", "places"
  add_foreign_key "articles", "users", column: "author_id"
  add_foreign_key "commissions", "leads"
  add_foreign_key "lead_status_events", "leads"
  add_foreign_key "lead_status_events", "users"
  add_foreign_key "leads", "merchants"
  add_foreign_key "leads", "users", column: "submitted_by_id"
  add_foreign_key "merchants", "places"
  add_foreign_key "merchants", "sectors"
  add_foreign_key "places", "places", column: "parent_id"
  add_foreign_key "qr_scans", "merchants"
  add_foreign_key "users", "merchants"
end
