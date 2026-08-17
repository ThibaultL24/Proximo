# app/services/app_urls.rb
class AppUrls
  DEMO_FRONTEND_URL = "https://demo.fenetreouverte.fr".freeze

  def self.frontend_url
    explicit = ENV["FRONTEND_URL"].presence
    return explicit.to_s.chomp("/") if explicit

    Rails.env.development? ? "http://localhost:5173" : DEMO_FRONTEND_URL
  end

  def self.backend_url
    explicit = ENV["BACKEND_URL"].presence
    return explicit.to_s.chomp("/") if explicit

    Rails.env.development? ? "http://127.0.0.1:3000" : frontend_url
  end
end
