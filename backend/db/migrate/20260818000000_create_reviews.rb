# db/migrate/20260818000000_create_reviews.rb
class CreateReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.references :reviewable, polymorphic: true, null: false
      t.text :body, null: false
      t.integer :rating
      t.boolean :hidden, null: false, default: false
      t.timestamps
    end

    add_index :reviews, %i[user_id reviewable_type reviewable_id], unique: true, name: "index_reviews_on_user_and_reviewable"
    add_index :reviews, %i[reviewable_type reviewable_id hidden]

    create_table :review_replies do |t|
      t.references :review, null: false, foreign_key: true, index: { unique: true }
      t.references :user, null: false, foreign_key: true
      t.text :body, null: false
      t.timestamps
    end
  end
end
