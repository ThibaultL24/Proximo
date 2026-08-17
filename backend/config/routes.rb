Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      namespace :auth do
        post "login", to: "sessions#create"
        post "register", to: "registrations#create"
        post "agency_register", to: "agency_registrations#create"
        delete "logout", to: "sessions#destroy"
        get "me", to: "sessions#show"
      end

      namespace :public do
        get "feed", to: "feed#index"
        resources :sectors, only: %i[index show], param: :slug
        get "places", to: "places#index"
        get "places/lookup", to: "places#lookup"
        resources :merchants, only: %i[index show], param: :slug
        resources :articles, only: %i[index show], param: :slug
        resources :publications, only: %i[show]
        get "reviews", to: "reviews#index"
        resources :products, only: %i[index show], param: :slug
        post "products/:product_slug/checkout", to: "product_checkouts#create"
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
        resource :billing, only: %i[show create], controller: "billing" do
          get :portal, on: :member
          get :invoices, on: :member
        end
        delete "profile/photos", to: "photos#destroy"
        resources :leads, only: %i[index create]
        resources :publications, only: %i[index create]
        resources :social_accounts, only: %i[index create destroy], param: :provider do
          member do
            post :connect
          end
        end
      end

      namespace :oauth do
        get "social/:provider/callback", to: "social#callback"
      end

      namespace :client do
        resource :billing, only: %i[show create], controller: "billing" do
          get :portal, on: :member
          get :invoices, on: :member
        end
        resources :leads, only: %i[index create]
      end

      namespace :platform do
        resource :stats, only: :show, controller: "stats"
        resource :integrations, only: :show, controller: "integrations"
        resources :agencies, only: %i[index show]
      end

      namespace :admin do
        resource :billing, only: %i[show create], controller: "billing" do
          get :portal, on: :member
          get :invoices, on: :member
        end
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
        resources :reviews, only: %i[update]
      end

      resources :reviews, only: %i[create] do
        member do
          post :reply
        end
      end

      namespace :webhooks do
        post "stripe", to: "stripe#create"
      end
    end
  end
end
