# app/controllers/api/v1/public/feed_controller.rb
module Api
  module V1
    module Public
      class FeedController < ApplicationController
        def index
          agency = default_agency
          return render json: [] unless agency

          items = FeedBuilder.call(
            agency: agency,
            category: params[:category],
            place_path: params[:place_path],
            limit: params.fetch(:limit, 30).to_i.clamp(1, 50)
          )

          render json: items
        end
      end
    end
  end
end
