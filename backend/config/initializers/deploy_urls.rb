# config/initializers/deploy_urls.rb
if ENV["RENDER_EXTERNAL_URL"].present?
  ENV["FRONTEND_URL"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["BACKEND_URL"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["FRONTEND_ORIGIN"] ||= ENV["RENDER_EXTERNAL_URL"].chomp("/")
  ENV["APP_HOST"] ||= ENV["RENDER_EXTERNAL_HOSTNAME"]
end
