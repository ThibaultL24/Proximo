Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      namespace :auth do
        post "login", to: "sessions#create"
        delete "logout", to: "sessions#destroy"
        get "me", to: "sessions#show"
      end

      namespace :public do
        resources :sectors, only: %i[index show], param: :slug
        get "places", to: "places#index"
        get "places/lookup", to: "places#lookup"
        resources :merchants, only: %i[index show], param: :slug
        resources :articles, only: %i[index show], param: :slug
        get "qr/:token", to: "qr#show"
        post "qr/:token/scan", to: "qr#scan"
        get "qr/:token/image", to: "qr#image"
      end

      namespace :merchant do
        get "stats", to: "stats#show"
        resource :profile, only: %i[show update], controller: "profiles"
        resource :qr, only: :show, controller: "qr"
        resource :stripe_connect, only: %i[show create], controller: "stripe_connect" do
          get :dashboard
        end
        delete "profile/photos", to: "photos#destroy"
        resources :leads, only: %i[index create]
      end

      namespace :admin do
        resources :merchants do
          resource :qr, only: :show, controller: "merchant_qr"
        end
        resources :articles
        resources :leads, only: %i[index show update] do
          member do
            patch :qualify
            patch :reject
            patch :convert
          end
        end
        resources :commissions, only: %i[index show update] do
          collection do
            get :export
          end
          resource :checkout, only: :create, controller: "commission_checkouts"
        end
        resource :stats, only: :show, controller: "stats"
      end

      namespace :webhooks do
        post "stripe", to: "stripe#create"
      end
    end
  end
end
