# app/controllers/spa_controller.rb
class SpaController < ActionController::Base
  def index
    file = Rails.public_path.join("index.html")
    if file.exist?
      send_file file, type: "text/html; charset=utf-8", disposition: "inline"
    else
      render plain: "Frontend build missing", status: :not_found
    end
  end
end
