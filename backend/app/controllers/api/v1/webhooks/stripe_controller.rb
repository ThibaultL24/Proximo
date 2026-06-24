# app/controllers/api/v1/webhooks/stripe_controller.rb
module Api
  module V1
    module Webhooks
      class StripeController < ApplicationController
        def create
          payload = request.body.read
          signature = request.env["HTTP_STRIPE_SIGNATURE"]
          secret = ENV["STRIPE_WEBHOOK_SECRET"]

          if secret.blank?
            Rails.logger.warn("STRIPE_WEBHOOK_SECRET missing — webhook ignored")
            return head :ok
          end

          event = Stripe::Webhook.construct_event(payload, signature, secret)
          StripeWebhookHandler.call(event)
          head :ok
        rescue JSON::ParserError, Stripe::SignatureVerificationError
          head :bad_request
        end
      end
    end
  end
end
