# db/seeds.rb
require_relative "seeds/demo_content"

PlacesImporter.call unless Place.exists?(kind: :country)

sector = Sector.find_or_create_by!(slug: "centre-ville") do |s|
  s.name = "Centre historique"
  s.city = "Montpellier"
  s.position = 1
  s.description = "Commerces du coeur de ville montpellierain"
end
sector.update!(name: "Centre historique", city: "Montpellier")

herault = Place.departments.find_by(insee_code: "34") || Place.find_by(slug: "herault", kind: :department)
demo_city = Place.find_or_create_by!(parent: herault, slug: "montpellier") do |p|
  p.name = "Montpellier"
  p.kind = :city
  p.insee_code = "34172"
  p.position = 0
end
demo_city.update!(name: "Montpellier", insee_code: "34172")

district = Place.find_or_create_by!(parent: demo_city, slug: "centre-historique") do |p|
  p.name = "Centre historique"
  p.kind = :district
  p.insee_code = "3417201"
  p.position = 0
end
district.update!(name: "Centre historique")

merchant = sector.merchants.find_or_create_by!(slug: "boulangerie-martin") do |m|
  m.name = "Boulangerie Martin"
  m.status = :published
  m.featured = true
  m.place = district
end

DemoContent.enrich_boulangerie_martin!(merchant)
merchant.update!(place: district, sector: sector)

admin = User.find_or_create_by!(email: "admin@codeimmo.fr") do |u|
  u.password = "password123"
  u.role = :admin
  u.first_name = "Admin"
  u.last_name = "Immo"
end

User.find_or_create_by!(email: "martin@boulangerie.fr") do |u|
  u.password = "password123"
  u.role = :merchant
  u.first_name = "Jean"
  u.last_name = "Martin"
  u.merchant = merchant
end

occitanie = Place.regions.find_by(insee_code: "76") || Place.find_by(slug: "occitanie", kind: :region)

Article.find_or_create_by!(slug: "bienvenue-code-immobilier") do |a|
  a.title = "Bienvenue sur Proxi Immo"
  a.excerpt = "La gazette locale qui connecte commercants et immobilier."
  a.body = "Decouvrez les commercants partenaires et le reseau Proxi Immo."
  a.category = :agency_news
  a.status = :published
  a.published_at = Time.current
  a.author = admin
  a.place = occitanie
end

portrait = Article.find_or_initialize_by(slug: "portrait-boulangerie-martin")
portrait.assign_attributes(
  title: "Portrait : la Boulangerie Martin, institution du centre de Montpellier",
  excerpt: "Depuis 1987, Jean Martin et son levain naturel rythment les matins du quartier. Couronne martin, croissants primés et fournil chaleureux : rencontre avec un artisan apprécié de toute la ville.",
  body: DemoContent.portrait_article_body,
  category: :merchant_spotlight,
  status: :published,
  published_at: 2.weeks.ago,
  author: admin,
  merchant: merchant,
  place: district
)
portrait.save!

Article.find_or_initialize_by(slug: "diagnostic-dpe-2026").tap do |a|
  a.title = "Diagnostic DPE : ce qui change pour les vendeurs en 2026"
  a.excerpt = "Performance energetique, audit obligatoire, impact sur la valorisation : le point technique pour preparer une mise en vente sereine."
  a.body = <<~TEXT.strip
    ## Pourquoi le DPE reste central

    Le diagnostic de performance energetique n'est plus une simple formalite administrative.
    En 2026, il conditionne la mise en vente, la decence du logement et la perception des acheteurs.

    ## Les seuils a connaitre

    - **Passoire thermique** : logements classes F ou G
    - **Audit energetique** : obligatoire dans certains cas avant annonce
    - **Travaux de renovation** : peuvent etre anticipes pour securiser la transaction

    ## Conseil Proxi Immo

    Avant toute estimation, faites auditer votre bien. Nos equipes vous orientent vers des diagnostiqueurs
    partenaires et vous aident a lire les leviers d'optimisation avant publication.
  TEXT
  a.category = :real_estate
  a.status = :published
  a.published_at = 1.week.ago
  a.author = admin
  a.place = occitanie
  a.save!
end

puts "Seeds OK"
puts "Places: #{Place.count} (regions: #{Place.regions.count}, departments: #{Place.departments.count})"
puts "Boulangerie Martin: #{merchant.photos.count} photos, article gazette publie"
puts "Admin: admin@codeimmo.fr / password123"
puts "Commercant: martin@boulangerie.fr / password123"
