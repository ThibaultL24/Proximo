# app/controllers/concerns/merchant_subscription_required.rb
module MerchantSubscriptionRequired
  extend ActiveSupport::Concern

  private

  def require_merchant_subscription!
    merchant = current_user&.merchant
    return forbidden unless merchant

    return if MerchantSubscriptionService.for(merchant).active?

    render json: {
      error: "subscription_required",
      message: "Un abonnement actif est requis pour cette fonctionnalite",
      subscription: MerchantSubscriptionService.for(merchant).status
    }, status: :payment_required
  end
end
