module Api
  module V1
    module Territories
      class BaseController < ApplicationController
        private

        def territory
          @territory ||= Territory.visible.find_by!(slug: params[:territory_slug])
        end

        def editor_membership
          @editor_membership ||= current_user&.territory_memberships&.find_by(territory_id: territory.id)
        end

        def require_editor!
          authenticate_user!
          return if performed?

          membership = editor_membership
          forbidden unless membership&.owner? || membership&.editor?
        end
      end
    end
  end
end
