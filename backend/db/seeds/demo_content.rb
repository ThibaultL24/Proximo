# db/seeds/demo_content.rb
module DemoContent
  module_function

  def attach_remote_file(record, attachment, url, filename)
    require "open-uri"

    io = URI.open(url, read_timeout: 15, open_timeout: 10)
    record.public_send(attachment).attach(
      io: io,
      filename: filename,
      content_type: "image/jpeg"
    )
    puts "  Image OK: #{filename}"
  rescue StandardError => e
    puts "  Image skip (#{filename}): #{e.message}"
  end

  def enrich_boulangerie_martin!(merchant)
    merchant.update!(
      name: "Boulangerie Martin",
      short_description: "Artisan boulanger-patissier depuis 1987 — pain au levain, fougasse au romarin et tradition montpellieraine.",
      description: <<~TEXT.strip,
        Installée en 1987 au cœur du centre historique, la Boulangerie Martin est devenue une adresse incontournable
        de Montpellier. Jean Martin, formé chez un maître boulanger de Provence, a repris la boutique familiale
        après des années passées à perfectionner son savoir-faire sur les fournées au levain naturel.

        Chaque matin, des fournées sortent du four des 6 h : baguette tradition, pain de campagne au seigle,
        fougasse aux olives et aux herbes du Languedoc. Les habitants du quartier — familles, étudiants,
        commerçants voisins — s'y retrouvent pour le petit-déjeuner et le goûter du samedi.

        Appréciée de tous, la maison est surtout connue pour sa spécialité signature : la « couronne martin »,
        un pain couronne croustillant garni de graines de sésame et de lin, et ses croissants au beurre AOP
        Charentes-Poitou, élu meilleur croissant du quartier lors de la Fête du Commerce de proximité en 2023.

        Derrière le comptoir, Jean et son équipe de trois artisans partagent la même exigence : des farines
        sélectionnées, un levain entretenu depuis quarante ans, et le plaisir simple d'un bon pain chaud
        à partager entre voisins.
      TEXT
      address: "12 rue de la République",
      postal_code: "34000",
      city: "Montpellier",
      phone: "04 67 55 12 34",
      email: "contact@boulangerie-martin.fr",
      website: "https://boulangerie-martin.fr",
      featured: true,
      status: :published,
      opening_hours: {
        lundi: "06:30 - 19:30",
        mardi: "06:30 - 19:30",
        mercredi: "06:30 - 19:30",
        jeudi: "06:30 - 19:30",
        vendredi: "06:30 - 19:30",
        samedi: "06:30 - 19:30",
        dimanche: "07:00 - 13:00"
      }
    )

    merchant.logo.purge if merchant.logo.attached?
    merchant.photos.purge

    attach_remote_file(
      merchant,
      :logo,
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=400&q=80",
      "logo-boulangerie-martin.jpg"
    )

    [
      ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&h=675&q=80", "fournee-pain.jpg"],
      ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&h=675&q=80", "viennoiseries.jpg"],
      ["https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&h=675&q=80", "vitrine-boulangerie.jpg"],
      ["https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&h=675&q=80", "comptoir-artisan.jpg"]
    ].each do |url, filename|
      attach_remote_file(merchant, :photos, url, filename)
    end
  end

  def portrait_article_body
    <<~TEXT.strip
      ## Une institution du centre historique

      Quand Jean Martin ouvre sa boulangerie en **1987**, la rue de la République n'a pas encore
      retrouvé tout son animation. Il arrive avec une certitude : un quartier vit mieux quand
      il sent le pain chaud au petit matin. Quarante ans plus tard, personne ne contredit cette intuition.

      ## Le levain, un héritage familial

      Formé auprès de son oncle boulanger à Carpentras, Jean a rapporté de Provence l'amour du levain
      naturel — le même levain que l'on retrouve aujourd'hui dans chaque fournée. « On ne triche pas
      avec le temps », résume-t-il avec un sourire. « Un bon pain, ça ne s'improvise pas. »

      ## La spécialité qui fait parler d'elle

      La **couronne martin** est devenue la signature de la maison : une couronne dorée aux graines
      de sésame et de lin, croustillante dehors, moelleuse dedans. Les croissants au beurre AOP
      ne sont pas en reste — en 2023, ils ont remporté le prix du public lors de la Fête du
      Commerce de proximité de Montpellier.

      ## Un commerce où l'on se retrouve

      Ici, on vient pour le pain, mais on reste pour l'ambiance. Les voisins se saluent à la sortie
      du fournil, les enfants du lycée voisin s'arrêtent pour une brioche au chocolat, et les
      commerçants du réseau Proxi Immo recommandent volontiers l'adresse aux nouveaux arrivants
      du quartier.

      > « Une boulangerie, ce n'est pas seulement un commerce. C'est le cœur qui bat d'un quartier. »
      > — Jean Martin

      ## Horaires

      Du lundi au samedi : 6 h 30 – 19 h 30 · Dimanche : 7 h – 13 h
      12 rue de la République, 34000 Montpellier · 04 67 55 12 34
    TEXT
  end
end
