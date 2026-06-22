# app/controllers/api/v1/public/articles_controller.rb
module Api
  module V1
    module Public
      class ArticlesController < ApplicationController
        def index
          articles = ::Article.published.includes(:merchant, :place).order(published_at: :desc)
          articles = filter_by_place(articles)
          articles = filter_by_scope(articles)
          render json: ArticleSerializer.new(articles).serializable_hash
        end

        def show
          article = ::Article.published.find_by!(slug: params[:slug])
          render json: ArticleSerializer.new(article).serializable_hash
        end

        private

        def filter_by_place(articles)
          return articles unless params[:place_path].present?

          place = ::Place.find_by_path!(params[:place_path].split("/"))
          ids = place.descendant_ids

          articles.left_joins(:merchant).where(
            "articles.place_id IN (:ids) OR merchants.place_id IN (:ids)",
            ids: ids
          )
        end

        def filter_by_scope(articles)
          case params[:scope]
          when "gazette"
            articles.gazette
          when "immo"
            articles.immo
          else
            params[:category].present? ? articles.where(category: params[:category]) : articles
          end
        end
      end
    end
  end
end
