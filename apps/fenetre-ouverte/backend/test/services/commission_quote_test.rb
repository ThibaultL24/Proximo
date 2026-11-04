# test/services/commission_quote_test.rb
require "test_helper"

class CommissionQuoteTest < ActiveSupport::TestCase
  setup do
    @agency = create_agency!(slug: "quote-agency")
    @user = create_user!(agency: @agency, role: :client)
  end

  test "sell uses a 150 euro flat fee and 10 percent platform cut" do
    lead = @agency.leads.create!(
      submitted_by: @user,
      contact_name: "Marie",
      contact_phone: "0612345678",
      lead_type: :sell,
      consent_given: true
    )
    quote = CommissionQuote.for(lead)

    assert_equal 15_000, quote[:amount_cents]
    assert_equal 1_500, quote[:platform_fee_cents]
    assert_equal 13_500, quote[:merchant_amount_cents]
    assert_equal "EUR", quote[:currency]
  end

  test "buy uses 1 percent of budget capped between 50 and 300 euros" do
    lead = @agency.leads.create!(
      submitted_by: @user,
      contact_name: "Paul",
      contact_phone: "0612345678",
      lead_type: :buy,
      budget_max: 250_000,
      consent_given: true
    )
    quote = CommissionQuote.for(lead)

    assert_equal 30_000, quote[:amount_cents]
    assert_equal 3_000, quote[:platform_fee_cents]
  end
end
