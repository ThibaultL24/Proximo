module Api
  module V1
    module Merchant
      # Contrôle manuel uniquement : cette action n'écrit JAMAIS d'article
      # sur WordPress et ne relance aucune diffusion incertaine.
      class SocialPostVerificationsController < ApplicationController
        before_action :authenticate_user!

        def create
          merchant = current_user&.merchant
          return forbidden unless merchant

          post = SocialPost.joins(:publication)
                           .where(publications: { merchant_id: merchant.id })
                           .find_by(id: params[:id])
          return not_found unless post

          unless post.wordpress? && post.uncertain?
            return render json: { error: "Seules les diffusions WordPress incertaines sont vérifiables" },
                          status: :conflict
          end

          account = merchant.social_accounts.find_by(provider: :wordpress)
          unless account&.connected? && !account.demo? &&
                 post.destination_url.present? && post.destination_url == account.external_id
            return render json: { error: "Reconnectez le blog WordPress initial avant vérification" },
                          status: :conflict
          end

          client = Social::WordpressClient.new(
            site_url: account.external_id, username: account.account_name,
            application_password: account.access_token
          )
          existing = client.find_published(slug: post.wordpress_delivery_slug)

          if existing
            post.update!(
              status: :published, external_post_id: existing.fetch("id").to_s,
              external_url: existing["link"].to_s.start_with?("https://") ? existing["link"] : nil,
              published_at: Time.current, error_message: nil
            )
            post.publication.update!(syndicated: true)
            render json: { status: post.status, external_url: post.external_url,
                           message: "Article retrouvé sur le blog et confirmé" }
          else
            render json: { status: post.status, external_url: nil,
                           message: "Article introuvable à cet instant. Vérifiez aussi dans WordPress avant toute nouvelle diffusion." }
          end
        rescue Social::WordpressClient::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
