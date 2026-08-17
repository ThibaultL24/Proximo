# app/models/review.rb
class Review < ApplicationRecord
  belongs_to :user
  belongs_to :reviewable, polymorphic: true
  has_one :reply, class_name: "ReviewReply", dependent: :destroy

  validates :body, presence: true, length: { maximum: 2000 }
  validates :rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :user_id, uniqueness: { scope: %i[reviewable_type reviewable_id] }

  scope :visible, -> { where(hidden: false) }
  scope :recent, -> { order(created_at: :desc) }
end
