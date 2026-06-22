# app/controllers/api/v1/admin/articles_controller.rb
module Api
  module V1
    module Admin
      class ArticlesController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_article, only: %i[show update destroy]

        def index
          authorize ::Article
          articles = policy_scope(::Article).includes(:author, :merchant, :place).order(published_at: :desc, created_at: :desc)
          articles = articles.where(status: params[:status]) if params[:status].present?
          articles = articles.where(category: params[:category]) if params[:category].present?
          articles = filter_by_scope(articles)
          render json: AdminArticleSerializer.new(articles).serializable_hash
        end

        def show
          authorize @article
          render json: AdminArticleSerializer.new(@article).serializable_hash
        end

        def create
          authorize ::Article
          article = ::Article.new(article_params.merge(author: current_user))
          apply_published_at(article)

          if article.save
            render json: AdminArticleSerializer.new(article).serializable_hash, status: :created
          else
            render json: { errors: article.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          authorize @article
          @article.assign_attributes(article_params)
          apply_published_at(@article)

          if @article.save
            render json: AdminArticleSerializer.new(@article).serializable_hash
          else
            render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @article
          @article.destroy!
          head :no_content
        end

        private

        def set_article
          @article = ::Article.find(params[:id])
        end

        def article_params
          params.require(:article).permit(
            :title, :slug, :excerpt, :body, :category, :status, :published_at, :merchant_id, :place_id
          )
        end

        def filter_by_scope(articles)
          case params[:scope]
          when "gazette"
            articles.gazette
          when "immo"
            articles.immo
          else
            articles
          end
        end

        def apply_published_at(article)
          return unless article.published? && article.published_at.blank?

          article.published_at = Time.current
        end
      end
    end
  end
end
