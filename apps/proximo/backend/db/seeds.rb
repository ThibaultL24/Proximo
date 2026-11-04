# db/seeds.rb
require_relative "seeds/demo_content"

PlacesImporter.call unless Place.exists?(kind: :country)

agency = Agency.find_or_create_by!(slug: "fenetre-ouverte") do |a|
  a.name = "Fenêtre Ouverte"
  a.city = "Bourg-Saint-Andéol"
  a.status = :active
  a.subscription_status = "active"
end
agency.update!(name: "Fenêtre Ouverte", city: "Bourg-Saint-Andéol", status: :active, subscription_status: "active")

auvergne = Place.regions.find_by(insee_code: "84") || Place.find_by(slug: "auvergne-rhone-alpes", kind: :region)
ardeche = Place.departments.find_by(insee_code: "07") || Place.find_by(slug: "ardeche", kind: :department)

bourg = Place.find_or_create_by!(parent: ardeche, slug: "bourg-saint-andeol") do |p|
  p.name = "Bourg-Saint-Andéol"
  p.kind = :city
  p.insee_code = "07042"
  p.position = 0
end
bourg.update!(name: "Bourg-Saint-Andéol", insee_code: "07042")

sector = agency.sectors.find_or_create_by!(slug: "bourg-centre") do |s|
  s.name = "Centre-ville"
  s.city = "Bourg-Saint-Andéol"
  s.position = 1
  s.description = "Commerces et services du coeur de Bourg-Saint-Andéol"
end
sector.update!(name: "Centre-ville", city: "Bourg-Saint-Andéol")

merchant = sector.merchants.find_or_create_by!(slug: "boulangerie-martin") do |m|
  m.name = "Boulangerie Martin"
  m.status = :published
  m.featured = true
  m.place = bourg
  m.agency = agency
  m.partner_category = :commerces
  m.city = "Bourg-Saint-Andéol"
  m.postal_code = "07700"
end

DemoContent.enrich_boulangerie_martin!(merchant)
merchant.update!(
  place: bourg,
  sector: sector,
  agency: agency,
  partner_category: :commerces,
  city: "Bourg-Saint-Andéol",
  postal_code: "07700",
  subscription_status: "active"
)

User.find_or_create_by!(email: "super@fenetreouverte.fr") do |u|
  u.password = "password123"
  u.role = :super_admin
  u.first_name = "Super"
  u.last_name = "Admin"
end

admin = User.find_or_create_by!(email: "admin@fenetreouverte.fr") do |u|
  u.password = "password123"
  u.role = :admin
  u.first_name = "Jean-Michel"
  u.last_name = "Admin"
  u.agency = agency
end
admin.update!(agency: agency)

merchant_user = User.find_or_create_by!(email: "martin@boulangerie.fr") do |u|
  u.password = "password123"
  u.role = :merchant
  u.first_name = "Jean"
  u.last_name = "Martin"
  u.merchant = merchant
end
merchant_user.update!(merchant: merchant)

User.find_or_create_by!(email: "client@demo.fr") do |u|
  u.password = "password123"
  u.role = :client
  u.first_name = "Marie"
  u.last_name = "Dupont"
  u.phone = "0612345678"
  u.agency = agency
end

merchant.update!(
  facebook_page_url: "https://facebook.com/boulangerie-martin-demo",
  instagram_handle: "boulangerie_martin",
  tiktok_handle: "boulangerie.martin"
)

%w[facebook instagram tiktok].each do |provider|
  merchant.social_accounts.find_or_create_by!(provider: provider) do |account|
    account.account_name = merchant.social_page_label(provider) || "Boulangerie Martin (#{provider.capitalize})"
    account.access_token = "demo"
    account.status = :connected
    account.connected_at = Time.current
  end
end

Article.find_or_initialize_by(agency: agency, slug: "bienvenue-fenetre-ouverte").tap do |a|
  a.title = "Bienvenue sur Fenêtre Ouverte"
  a.excerpt = "L'information locale, l'immobilier et les bonnes adresses du 07700."
  a.body = "Découvrez les commerces, associations et acteurs de Bourg-Saint-Andéol et des communes voisines."
  a.category = :agency_news
  a.status = :published
  a.published_at = 3.days.ago
  a.author = admin
  a.place = bourg
  a.save!
end

portrait = Article.find_or_initialize_by(agency: agency, slug: "portrait-boulangerie-martin")
portrait.assign_attributes(
  title: "La Boulangerie Martin, bonne adresse du centre de Bourg",
  excerpt: "Pain au levain, fouace ardéchoise et accueil chaleureux : rencontre avec un artisan apprécié du 07700.",
  body: DemoContent.portrait_article_body,
  category: :merchant_spotlight,
  status: :published,
  published_at: 1.day.ago,
  author: admin,
  merchant: merchant,
  place: bourg
)
portrait.save!

Article.find_or_initialize_by(agency: agency, slug: "marche-immobilier-07700").tap do |a|
  a.title = "Immobilier : le marché du 07700 en 2026"
  a.excerpt = "Tendances, prix au m² et conseils pour vendre ou acheter dans le sud Ardèche."
  a.body = <<~TEXT.strip
    ## Un secteur attractif

    Entre Rhône et Gorges de l'Ardèche, le 07700 combine cadre de vie et dynamisme économique.

    ## Ce qu'il faut savoir

    - **Maisons de village** : forte demande sur Bourg-Saint-Andéol
    - **Locations saisonnières** : marché actif autour des Gorges
    - **Diagnostics** : anticipez les travaux avant la mise en vente

    ## Fenêtre Ouverte Immo

    Nos commerçants partenaires et l'équipe vous accompagnent dans votre projet.
  TEXT
  a.category = :real_estate
  a.status = :published
  a.published_at = 5.days.ago
  a.author = admin
  a.place = bourg
  a.save!
end

[
  {
    body: "Nouvelle fouace aux figues ce week-end ! Passez nous voir dès 7h, place du Marché.",
    category: :commerces,
    published_at: 2.days.ago
  },
  {
    body: "Merci pour vos visites lors de la fête du village. On vous attend dès demain matin !",
    category: :commerces,
    published_at: 5.days.ago
  }
].each_with_index do |attrs, index|
  pub = merchant.publications.find_or_create_by!(body: attrs[:body]) do |p|
    p.agency = agency
    p.category = attrs[:category]
    p.status = :published
    p.published_at = attrs[:published_at]
    p.syndicated = index.zero?
  end

  next unless pub.syndicated?

  %w[facebook instagram tiktok].each do |provider|
    pub.social_posts.find_or_create_by!(provider: provider) do |post|
      post.status = :published
      post.external_post_id = "demo-seed-#{provider}-#{pub.id}"
      post.published_at = pub.published_at
    end
  end
end

require_relative "seeds/demo_merchants_07700"
DemoMerchants07700.call(agency: agency, admin: admin, sector: sector)

client = User.find_by!(email: "client@demo.fr")
merchant_user = User.find_by!(email: "martin@boulangerie.fr")

merchant_review = Review.find_or_create_by!(user: client, reviewable: merchant) do |r|
  r.body = "Pain excellent et accueil chaleureux. La fouace aux figues est un must du week-end !"
  r.rating = 5
end
ReviewReply.find_or_create_by!(review: merchant_review) do |reply|
  reply.user = merchant_user
  reply.body = "Merci Marie ! On vous garde une fouace bien chaude samedi matin."
end

portrait_review = Review.find_or_create_by!(user: client, reviewable: portrait) do |r|
  r.body = "Bel article, envie d'y goûter ce week-end !"
  r.rating = 5
end
ReviewReply.find_or_create_by!(review: portrait_review) do |reply|
  reply.user = admin
  reply.body = "Merci pour votre retour — c'est un plaisir de mettre en avant les artisans du 07700."
end

first_publication = merchant.publications.published.order(:published_at).first
if first_publication
  Review.find_or_create_by!(user: client, reviewable: first_publication) do |r|
    r.body = "Hâte de goûter la fouace ce week-end — merci pour l'info !"
    r.rating = 4
  end.tap do |review|
    ReviewReply.find_or_create_by!(review:) do |reply|
      reply.user = merchant_user
      reply.body = "On vous attend dès 7 h samedi, fouace toute fraîche !"
    end
  end
end

[
  [portrait, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=675&q=80", "cover-portrait-martin.jpg"],
  [Article.find_by!(agency: agency, slug: "marche-immobilier-07700"), "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=675&q=80", "cover-immo.jpg"]
].each do |article, url, filename|
  next if article.cover_image.attached?

  DemoContent.attach_remote_file(article, :cover_image, url, filename)
end

[
  {
    slug: "guide-vendeur-07700",
    name: "Guide vendeur 07700",
    description: "PDF lorem : check-list mise en vente, diagnostics et conseils agence Fenêtre Ouverte.",
    price_cents: 2500,
    checkout_mode: :one_time,
    merchant: nil,
    image_url: nil
  },
  {
    slug: "coffret-fouace-martin",
    name: "Coffret fouace du samedi",
    description: "Fouace aux figues + baguette levain — retrait en boutique. Code promo FOUACE10 (−10 %).",
    price_cents: 1800,
    checkout_mode: :promo,
    merchant: merchant,
    image_url: nil
  },
  {
    slug: "panier-decouverte-martin",
    name: "Panier decouverte Martin",
    description: "Selection de pains et viennoiseries du jour — retrait en boutique sous 24 h.",
    price_cents: 1200,
    checkout_mode: :one_time,
    merchant: merchant,
    image_url: nil
  },
  {
    slug: "audit-immo-express",
    name: "Audit immo express",
    description: "Visite conseil lorem : estimation, points de vigilance et plan d'action sous 48 h.",
    price_cents: 9900,
    checkout_mode: :installment,
    merchant: nil,
    image_url: nil
  },
  {
    slug: "don-territoire-07700",
    name: "Don au territoire 07700",
    description: "Montant libre (5 € à 200 €) pour soutenir l'info locale Fenêtre Ouverte.",
    price_cents: 1000,
    checkout_mode: :custom,
    merchant: nil,
    image_url: nil
  }
].each do |attrs|
  merchant_ref = attrs.delete(:merchant)
  Product.find_or_initialize_by(agency: agency, slug: attrs[:slug]).tap do |product|
    product.assign_attributes(
      attrs.merge(status: :published, merchant: merchant_ref)
    )
    product.save!
  end
end

Product.where(agency: agency, slug: "abonnement-pan-surprise").destroy_all

require_relative "seeds/demo_enrichment"
DemoEnrichment.call(agency: agency, merchant: merchant, client: client, admin: admin)

puts "Seeds OK — Fenêtre Ouverte 07700"
puts "Agency: #{agency.name} (#{agency.slug})"
puts "Territoire: #{bourg.name} (#{bourg.slug})"
puts "Super admin: super@fenetreouverte.fr / password123"
puts "Admin: admin@fenetreouverte.fr / password123"
puts "Commercant: martin@boulangerie.fr / password123"
puts "Client: client@demo.fr / password123"
