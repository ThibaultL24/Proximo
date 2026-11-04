# app/services/review_reply_creator.rb
class ReviewReplyCreator
  def self.call(user:, review:, body:)
    new(user:, review:, body:).call
  end

  def initialize(user:, review:, body:)
    @user = user
    @review = review
    @body = body
  end

  def call
    raise Pundit::NotAuthorizedError unless authorized?
    raise ActiveRecord::RecordInvalid, reply if review.reply.present?

    reply.save!
    reply
  end

  private

  attr_reader :user, :review, :body

  def reply
    @reply ||= ReviewReply.new(review:, user:, body:)
  end

  def authorized?
    case review.reviewable
    when Merchant
      user.merchant? && user.merchant_id == review.reviewable_id
    when Publication
      user.merchant? && user.merchant_id == review.reviewable.merchant_id
    when Article
      user.admin? && user.agency_id == review.reviewable.agency_id
    else
      false
    end
  end
end
