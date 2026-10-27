module Api
  module V1
    module Territories
      class ArticlesController < BaseController
        before_action :require_editor!, only: :update

        def index
          articles = territory.articles.published.order(published_at: :desc)
          articles = articles.gazette if params[:scope] == "gazette"
          render json: ArticleSerializer.new(articles).serializable_hash
        end

        def show
          article = territory.articles.published.find_by!(slug: params[:id])
          render json: ArticleSerializer.new(article).serializable_hash
        end

        # Transitional editorial endpoint: draft editing only.
        # No publishing or changing ownership via this route.
        def update
          article = territory.articles.find(params[:id])
          unless article.draft?
            return render json: { error: "Seuls les brouillons sont modifiables ici" },
                          status: :unprocessable_entity
          end

          if article.update(params.require(:article).permit(:title, :excerpt, :body))
            render json: ArticleSerializer.new(article).serializable_hash
          else
            render json: { errors: article.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
