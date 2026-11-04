# test/services/review_creator_test.rb
require "test_helper"

class ReviewCreatorTest < ActiveSupport::TestCase
  setup do
    @agency = create_agency!(slug: "review-agency-#{SecureRandom.hex(4)}")
    @sector = create_sector!(agency: @agency)
    @merchant = create_merchant!(agency: @agency, sector: @sector)
    @client = create_user!(agency: @agency, role: :client)
    @merchant_user = User.create!(
      email: "merchant-#{SecureRandom.hex(4)}@test.fr",
      password: "password123",
      role: :merchant,
      first_name: "Jean",
      last_name: "Martin",
      merchant: @merchant
    )
  end

  test "client can review a published merchant" do
    review = ReviewCreator.call(
      user: @client,
      reviewable: @merchant,
      body: "Excellent pain au levain.",
      rating: 5
    )

    assert review.persisted?
    assert_equal 5, review.rating
  end

  test "merchant cannot review own profile" do
    assert_raises(Pundit::NotAuthorizedError) do
      ReviewCreator.call(
        user: @merchant_user,
        reviewable: @merchant,
        body: "Mon propre avis"
      )
    end
  end

  test "one review per user per reviewable" do
    ReviewCreator.call(user: @client, reviewable: @merchant, body: "Premier avis")

    assert_raises(ActiveRecord::RecordInvalid) do
      ReviewCreator.call(user: @client, reviewable: @merchant, body: "Deuxième avis")
    end
  end
end
