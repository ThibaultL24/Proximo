# app/controllers/api/v1/admin/merchants_controller.rb
module Api
  module V1
    module Admin
      class MerchantsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_merchant, only: %i[show update destroy]

        def index
          authorize ::Merchant
          merchants = policy_scope(::Merchant).includes(:sector, :place).order(:name)
          merchants = merchants.where(status: params[:status]) if params[:status].present?
          merchants = merchants.where(sector_id: params[:sector_id]) if params[:sector_id].present?
          render json: AdminMerchantSerializer.new(merchants).serializable_hash
        end

        def show
          authorize @merchant
          render json: AdminMerchantSerializer.new(@merchant).serializable_hash
        end

        def create
          authorize ::Merchant
          merchant = ::Merchant.new(merchant_params)

          if merchant.save
            render json: AdminMerchantSerializer.new(merchant).serializable_hash, status: :created
          else
            render json: { errors: merchant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          authorize @merchant
          if @merchant.update(merchant_params)
            render json: AdminMerchantSerializer.new(@merchant).serializable_hash
          else
            render json: { errors: @merchant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @merchant
          @merchant.destroy!
          head :no_content
        rescue ActiveRecord::DeleteRestrictionError
          render json: { error: "Impossible de supprimer : ce commercant a des leads associes" }, status: :unprocessable_entity
        end

        private

        def set_merchant
          @merchant = ::Merchant.find(params[:id])
        end

        def merchant_params
          params.require(:merchant).permit(
            :name, :slug, :sector_id, :place_id, :short_description, :description,
            :address, :postal_code, :city, :phone, :email, :website,
            :status, :featured, :logo, photos: []
          )
        end
      end
    end
  end
end
