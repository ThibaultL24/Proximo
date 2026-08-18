# config/initializers/deploy_urls.rb
if ENV["RENDER_EXTERNAL_URL"].present?
  ENV["FRONTEND_URL"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["BACKEND_URL"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["FRONTEND_ORIGIN"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["APP_HOST"] ||= ENV["RENDER_EXTERNAL_HOSTNAME"]
end

if Rails.env.production?
  host = ENV["APP_HOST"].presence || ENV["RENDER_EXTERNAL_HOSTNAME"]
  if host.present?
    opts = { host: host, protocol: "https" }
    Rails.application.routes.default_url_options = opts
    Rails.application.config.action_mailer.default_url_options = opts
  end
end
