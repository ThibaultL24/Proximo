require "test_helper"

class LegacyAdminTenantIsolationTest < ActionDispatch::IntegrationTest
  setup do
    @first = create_agency!(slug: "first-agency-#{SecureRandom.hex(5)}")
    @second = create_agency!(slug: "second-agency-#{SecureRandom.hex(5)}")
    @admin = create_user!(agency: @first, role: :admin)
    @second_admin = create_user!(agency: @second, role: :admin)
    @other_lead = @second.leads.create!(
      submitted_by: @second_admin,
      contact_name: "Example",
      contact_phone: "0600000000",
      lead_type: :sell,
      consent_given: true
    )
    @other_commission = @other_lead.create_commission!(
      amount_cents: 15_000, platform_fee_cents: 1_500, status: :eligible, currency: "EUR"
    )
  end

  test "legacy lead detail and update reject a foreign agency ID" do
    get "/api/v1/admin/leads/#{@other_lead.id}", headers: auth
    assert_response :not_found

    patch "/api/v1/admin/leads/#{@other_lead.id}",
      params: { lead: { admin_notes: "intrusion" } }, headers: auth
    assert_response :not_found
    assert_nil @other_lead.reload.admin_notes
  end

  test "legacy lead status transition rejects a foreign agency ID" do
    patch "/api/v1/admin/leads/#{@other_lead.id}/qualify", headers: auth
    assert_response :not_found
    assert_equal "received", @other_lead.reload.status
  end

  test "legacy commission detail, update and checkout reject a foreign agency ID" do
    get "/api/v1/admin/commissions/#{@other_commission.id}", headers: auth
    assert_response :not_found

    patch "/api/v1/admin/commissions/#{@other_commission.id}",
      params: { commission: { status: "approved" } }, headers: auth
    assert_response :not_found
    assert_equal "eligible", @other_commission.reload.status

    post "/api/v1/admin/commissions/#{@other_commission.id}/checkout", headers: auth
    assert_response :not_found
  end

  test "legacy scoped lists do not leak foreign tenant data" do
    get "/api/v1/admin/leads", headers: auth
    assert_response :success
    assert_equal [], response.parsed_body

    get "/api/v1/admin/commissions", headers: auth
    assert_response :success
    assert_equal [], response.parsed_body
  end

  private

  def auth
    { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: @admin.id })}" }
  end
end
