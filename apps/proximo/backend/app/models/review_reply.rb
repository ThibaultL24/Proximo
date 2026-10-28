# app/models/review_reply.rb
class ReviewReply < ApplicationRecord
  belongs_to :review
  belongs_to :user

  validates :body, presence: true, length: { maximum: 2000 }
  validates :review_id, uniqueness: true
end
