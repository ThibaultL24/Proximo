# test/test_helper.rb
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)

    def create_agency!(slug: "fenetre-ouverte-test")
      Agency.create!(
        name: "Fenêtre Ouverte Test",
        slug: slug,
        city: "Bourg-Saint-Andéol",
        status: :active,
        subscription_status: "active"
      )
    end

    def create_sector!(agency:)
      agency.sectors.create!(
        name: "Centre-ville",
        slug: "centre-ville-#{SecureRandom.hex(4)}",
        city: "Bourg-Saint-Andéol",
        position: 1
      )
    end

    def create_merchant!(agency:, sector:, slug: nil)
      sector.merchants.create!(
        name: "Boulangerie Test",
        slug: slug || "boulangerie-test-#{SecureRandom.hex(4)}",
        status: :published,
        agency: agency,
        partner_category: :commerces,
        city: "Bourg-Saint-Andéol",
        postal_code: "07700",
        subscription_status: "active"
      )
    end

    def create_user!(agency:, role: :admin)
      User.create!(
        email: "#{role}-#{SecureRandom.hex(4)}@test.fr",
        password: "password123",
        role: role,
        first_name: "Test",
        last_name: role.to_s.capitalize,
        agency: agency
      )
    end
  end
end
