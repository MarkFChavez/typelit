Rails.application.routes.draw do
  root "books#index"

  resources :books, only: [ :index, :show, :new, :create, :destroy ] do
    get :continue, on: :member
  end

  resources :passages, only: [ :show ] do
    post :complete, on: :member
  end

  # Health check for load balancers
  get "up" => "rails/health#show", as: :rails_health_check
end
