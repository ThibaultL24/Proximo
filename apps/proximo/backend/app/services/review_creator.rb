# app/services/review_creator.rb
class ReviewCreator
  def self.call(user:, reviewable:, body:, rating: nil)
    new(user:, reviewable:, body:, rating:).call
  end

  def initialize(user:, reviewable:, body:, rating: nil)
    @user = user
    @reviewable = reviewable
    @body = body
    @rating = rating
  end

  def call
    raise Pundit::NotAuthorizedError unless authorized?

    review.save!
    review
  end

  private

  attr_reader :user, :reviewable, :body, :rating

  def review
    @review ||= Review.new(user:, reviewable:, body:, rating: normalized_rating)
  end

  def normalized_rating
    return nil if rating.blank?

    value = rating.to_i
    value.between?(1, 5) ? value : nil
  end

  def authorized?
    return false unless user.client? || user.merchant?
    return false if user.merchant? && reviewable.is_a?(Merchant) && reviewable.id == user.merchant_id

    published_reviewable?
  end

  def published_reviewable?
    case reviewable
    when Merchant then reviewable.published?
    when Article then reviewable.published?
    when Publication then reviewable.published?
    else false
    end
  end
end
