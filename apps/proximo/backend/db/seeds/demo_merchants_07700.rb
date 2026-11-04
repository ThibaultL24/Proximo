# db/seeds/demo_merchants_07700.rb
# Contenu démo / lorem pour nourrir les rubriques et l'annuaire 07700.
module DemoMerchants07700
  module_function

  COMMUNES = [
    { slug: "bourg-saint-andeol", name: "Bourg-Saint-Andéol", insee: "07042" },
    { slug: "saint-marcel-d-ardeche", name: "Saint-Marcel-d'Ardèche", insee: "07264" },
    { slug: "saint-just-d-ardeche", name: "Saint-Just-d'Ardèche", insee: "07259" },
    { slug: "saint-martin-d-ardeche", name: "Saint-Martin-d'Ardèche", insee: "07268" },
    { slug: "saint-remeze", name: "Saint-Remèze", insee: "07291" },
    { slug: "gras", name: "Gras", insee: "07099" },
    { slug: "bidon", name: "Bidon", insee: "07034" }
  ].freeze

  MERCHANTS = [
    {
      slug: "epicerie-du-rhone",
      name: "Épicerie du Rhône",
      commune: "bourg-saint-andeol",
      category: :commerces,
      featured: true,
      short: "Produits du coin, fromages et vins du sud Ardèche.",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Épicerie de proximité au centre de Bourg-Saint-Andéol : fruits, légumes, conserves artisanales et vins locaux.",
      address: "8 place du Marché",
      pubs: [
        "Arrivage de tomates anciennes et miel de lavande — venez ce matin dès 8 h.",
        "Lorem ipsum : paniers du week-end à réserver avant vendredi midi."
      ]
    },
    {
      slug: "cafe-des-halles",
      name: "Café des Halles",
      commune: "bidon",
      category: :commerces,
      featured: false,
      short: "Café-terrasse au cœur du village de Bidon.",
      description: "Sed do eiusmod tempor incididunt ut labore. Petit café de village, terrasse ombragée, viennoiseries le week-end.",
      address: "2 place de l'Église",
      pubs: [
        "Brunch du dimanche : oeufs brouillés, pain toasté et jus pressés. Places limitées.",
        "Playlist live ce samedi soir — lorem ipsum ambient village."
      ]
    },
    {
      slug: "fromagerie-laoul",
      name: "Fromagerie du Laoul",
      commune: "bidon",
      category: :commerces,
      featured: true,
      short: "Fromages de chèvre et produits fermiers.",
      description: "Ut enim ad minim veniam. Fromagerie artisanale près de Bidon, chèvres élevées sur le plateau du Laoul.",
      address: "Route du Laoul",
      pubs: [
        "Nouvelle tomme affinée 3 mois disponible dès demain.",
        "Visite de la ferme samedi — inscription au comptoir."
      ]
    },
    {
      slug: "amis-du-patrimoine",
      name: "Association Les Amis du Patrimoine",
      commune: "bourg-saint-andeol",
      category: :vie_locale,
      featured: true,
      short: "Visites guidées et chantiers bénévoles.",
      description: "Duis aute irure dolor in reprehenderit. Association qui anime le patrimoine bâti de Bourg et des villages voisins.",
      address: "12 rue du Cloître",
      pubs: [
        "Visite guidée du centre historique dimanche 10 h — rendez-vous devant la mairie.",
        "Appel à bénévoles pour le chantier pierre du mois prochain."
      ]
    },
    {
      slug: "comite-fetes-saint-just",
      name: "Comité des fêtes Saint-Just",
      commune: "saint-just-d-ardeche",
      category: :vie_locale,
      featured: false,
      short: "Fêtes de village et animations estivales.",
      description: "Excepteur sint occaecat cupidatat non proident. Le comité organise bals, brocantes et feu d'artifice à Saint-Just-d'Ardèche.",
      address: "Salle des fêtes",
      pubs: [
        "Brocante du 15 août : inscriptions des exposants ouvertes.",
        "Lorem ipsum — réunion publique jeudi 20 h à la salle des fêtes."
      ]
    },
    {
      slug: "asso-biodiversite-gras",
      name: "Collectif Biodiversité Gras",
      commune: "gras",
      category: :vie_locale,
      featured: false,
      short: "Ateliers nature et sentiers partagés.",
      description: "Nemo enim ipsam voluptatem. Collectif habitant pour préserver les chemins et la faune autour de Gras.",
      address: "Mairie de Gras",
      pubs: [
        "Chantier sentier ce samedi : gants fournis, venez nombreux.",
        "Conférence oiseaux du plateau — mercredi 18 h 30."
      ]
    },
    {
      slug: "canoe-gorges-ardeche",
      name: "Canoë Gorges Ardèche",
      commune: "saint-martin-d-ardeche",
      category: :loisirs,
      featured: true,
      short: "Location canoë et descentes guidées.",
      description: "Quis autem vel eum iure reprehenderit. Base nautique à Saint-Martin-d'Ardèche pour découvrir les Gorges en canoë.",
      address: "Quai de l'Ardèche",
      pubs: [
        "Places libres demain matin pour la descente demi-journée.",
        "Lorem ipsum : forfait famille week-end disponible en ligne."
      ]
    },
    {
      slug: "guide-nature-07700",
      name: "Guide Nature 07700",
      commune: "saint-remeze",
      category: :loisirs,
      featured: true,
      short: "Randonnées commentées sur le plateau.",
      description: "At vero eos et accusamus. Accompagnateur en montagne basé à Saint-Remèze, sorties faune et flore.",
      address: "Place de la Fontaine",
      pubs: [
        "Balade couchée de soleil vendredi — 8 places max.",
        "Découverte des dolines dimanche matin, départ 9 h."
      ]
    },
    {
      slug: "velos-remeze",
      name: "Location Vélos Remèze",
      commune: "saint-remeze",
      category: :loisirs,
      featured: false,
      short: "Vélos et VTT pour explorer le plateau.",
      description: "Temporibus autem quibusdam. Location de vélos à Saint-Remèze, cartes des circuits fournies.",
      address: "4 route des Gorges",
      pubs: [
        "Nouveaux VTT électriques arrivés — réservation conseillée.",
        "Lorem ipsum circuit famille 12 km balisé depuis le village."
      ]
    },
    {
      slug: "spa-lavande-marcel",
      name: "Spa Lavande",
      commune: "saint-marcel-d-ardeche",
      category: :bien_etre,
      featured: true,
      short: "Soins, massages et parenthèse détente.",
      description: "Itaque earum rerum hic tenetur. Institut de bien-être à Saint-Marcel-d'Ardèche, huiles essentielles de lavande.",
      address: "15 rue des Remparts",
      pubs: [
        "Offre duo massage 60 min — valable jusqu'à fin du mois.",
        "Nouveau soin visage aux plantes du plateau."
      ]
    },
    {
      slug: "yoga-plateau-gras",
      name: "Yoga du Plateau",
      commune: "gras",
      category: :bien_etre,
      featured: false,
      short: "Cours de yoga en salle et en extérieur.",
      description: "Nam libero tempore. Cours hebdomadaires à Gras, séances sunrise en été.",
      address: "Salle polyvalente",
      pubs: [
        "Cours découverte mercredi 19 h — tapis fournis.",
        "Lorem ipsum : stage week-end respiration et marche consciente."
      ]
    },
    {
      slug: "cabinet-osteopathie-bourg",
      name: "Cabinet Ostéopathie Bourg",
      commune: "saint-just-d-ardeche",
      category: :bien_etre,
      featured: false,
      short: "Consultations sur rendez-vous.",
      description: "Omnis voluptas assumenda est. Cabinet d'ostéopathie à Saint-Just-d'Ardèche, adultes et sportifs.",
      address: "3 avenue du Rhône",
      pubs: [
        "Créneaux urgences sportifs ouverts cette semaine.",
        "Lorem ipsum : atelier prévention dos samedi 11 h."
      ]
    },
    {
      slug: "immo-sud-ardeche",
      name: "Immo Sud Ardèche",
      commune: "bourg-saint-andeol",
      category: :immo,
      featured: true,
      short: "Estimation, vente et location dans le 07700.",
      description: "Et harum quidem rerum facilis. Agence immobilière de proximité à Bourg-Saint-Andéol.",
      address: "22 boulevard Gambetta",
      pubs: [
        "3 nouvelles maisons de village en exclusivité cette semaine.",
        "Lorem ipsum : permanence estimation gratuite samedi matin."
      ]
    },
    {
      slug: "diagnostics-ardeche",
      name: "Diagnostics Ardèche",
      commune: "saint-marcel-d-ardeche",
      category: :immo,
      featured: false,
      short: "DPE, amiante, électricité avant vente.",
      description: "Itaque earum rerum. Bureau de diagnostics immobiliers couvrant le 07700.",
      address: "Zone artisanale",
      pubs: [
        "Délais DPE ramenés à 5 jours ouvrés.",
        "Lorem ipsum pack vente complète à tarif fixe."
      ]
    }
  ].freeze

  ARTICLES = [
    {
      slug: "agenda-vie-locale-aout",
      title: "Agenda de la vie locale — août dans le 07700",
      excerpt: "Lorem ipsum : fêtes, marchés et rendez-vous associatifs à ne pas manquer.",
      category: :local_news,
      place: "bourg-saint-andeol",
      days_ago: 2,
      body: <<~MD
        ## Cette semaine

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.

        - Marché de Bourg — mercredi et samedi
        - Brocante de Saint-Just — inscriptions ouvertes
        - Visite patrimoine — dimanche 10 h

        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      MD
    },
    {
      slug: "initiative-sentiers-gras",
      title: "À Gras, les habitants entretiennent les sentiers",
      excerpt: "Chantier bénévole et lorem ipsum sur le plateau de la Dent de Rez.",
      category: :local_news,
      place: "gras",
      days_ago: 4,
      body: <<~MD
        ## Un collectif actif

        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.

        Les bénévoles se retrouvent chaque mois pour dégager les chemins et poser de la signalétique.
      MD
    },
    {
      slug: "portrait-spa-lavande",
      title: "Spa Lavande, parenthèse douce à Saint-Marcel",
      excerpt: "Portrait lorem ipsum d'un institut de bien-être du 07700.",
      category: :merchant_spotlight,
      place: "saint-marcel-d-ardeche",
      merchant: "spa-lavande-marcel",
      days_ago: 6,
      body: <<~MD
        ## Une adresse pour ralentir

        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.

        Massages, soins visage et huiles de lavande : une pause à deux pas des Gorges.
      MD
    },
    {
      slug: "conseils-achat-village",
      title: "Acheter une maison de village dans le 07700",
      excerpt: "Points de vigilance lorem ipsum avant de signer.",
      category: :real_estate,
      place: "bourg-saint-andeol",
      days_ago: 7,
      body: <<~MD
        ## Avant l'achat

        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

        - Vérifiez le DPE et les travaux éventuels
        - Anticipez le stationnement et les accès
        - Parlez aux voisins : le village se vit au quotidien
      MD
    }
  ].freeze

  def call(agency:, admin:, sector:)
    ardeche = Place.departments.find_by(insee_code: "07") || Place.find_by(slug: "ardeche", kind: :department)
    raise "Département Ardèche introuvable" unless ardeche

    places = COMMUNES.to_h do |c|
      place = Place.find_or_create_by!(parent: ardeche, slug: c[:slug]) do |p|
        p.name = c[:name]
        p.kind = :city
        p.insee_code = c[:insee]
        p.position = 0
      end
      place.update!(name: c[:name], insee_code: c[:insee], kind: :city)
      [c[:slug], place]
    end

    MERCHANTS.each_with_index do |attrs, index|
      place = places.fetch(attrs[:commune])
      merchant = sector.merchants.find_or_create_by!(slug: attrs[:slug]) do |m|
        m.name = attrs[:name]
        m.agency = agency
        m.status = :published
      end

      merchant.update!(
        name: attrs[:name],
        agency: agency,
        sector: sector,
        place: place,
        status: :published,
        featured: attrs[:featured],
        partner_category: attrs[:category],
        short_description: attrs[:short],
        description: attrs[:description],
        address: attrs[:address],
        city: place.name,
        postal_code: "07700",
        phone: format("04 75 %02d %02d %02d", 10 + index, 20 + index, 30 + index),
        email: "#{attrs[:slug]}@demo.fenetre-ouverte.fr",
        subscription_status: "active"
      )

      attrs[:pubs].each_with_index do |body, pub_index|
        merchant.publications.find_or_create_by!(body: body) do |p|
          p.agency = agency
          p.category = attrs[:category]
          p.status = :published
          p.published_at = (pub_index + 1).days.ago - index.hours
          p.syndicated = false
        end
      end
    end

    ARTICLES.each do |attrs|
      place = places.fetch(attrs[:place])
      merchant = attrs[:merchant] ? agency.merchants.find_by(slug: attrs[:merchant]) : nil
      article = Article.find_or_initialize_by(agency: agency, slug: attrs[:slug])
      article.assign_attributes(
        title: attrs[:title],
        excerpt: attrs[:excerpt],
        body: attrs[:body],
        category: attrs[:category],
        status: :published,
        published_at: attrs[:days_ago].days.ago,
        author: admin,
        place: place,
        merchant: merchant
      )
      article.save!
    end

    puts "DemoMerchants07700: #{MERCHANTS.size} commerçants, #{ARTICLES.size} articles, #{places.size} communes"
  end
end
