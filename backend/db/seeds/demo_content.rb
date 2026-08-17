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
      short_description: "Artisan boulanger-pâtissier — pain au levain, fouace ardéchoise et viennoiseries.",
      description: <<~TEXT.strip,
        Installée au centre de Bourg-Saint-Andéol, la Boulangerie Martin est une adresse du quotidien
        pour les habitants du 07700. Jean Martin travaille au levain naturel et propose pain de campagne,
        fouace et viennoiseries.

        Chaque matin, les fournées sortent dès 6 h 30 : baguette, pain au seigle, fouace aux figues.
        On y croise voisins, artisans et familles du village.

        Derrière le comptoir, l'équipe mise sur des farines soignées et le plaisir simple d'un bon pain chaud.
      TEXT
      address: "12 rue de la République",
      postal_code: "07700",
      city: "Bourg-Saint-Andéol",
      phone: "04 75 00 00 00",
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
      ## Une adresse du centre de Bourg

      Quand Jean Martin ouvre sa boulangerie, la rue de la République retrouve vite l'odeur du pain chaud
      au petit matin. Quarante ans plus tard, l'adresse reste un passage obligé pour beaucoup d'habitants
      de Bourg-Saint-Andéol.

      ## Le levain, un travail de patience

      Formé auprès d'un oncle boulanger, Jean a gardé l'habitude du levain naturel.
      « On ne triche pas avec le temps », résume-t-il. « Un bon pain, ça ne s'improvise pas. »

      ## Ce qu'on y trouve

      Pain au levain, fouace ardéchoise, croissants et brioches. Les voisins se saluent à la sortie
      du fournil ; les enfants s'arrêtent pour une brioche au chocolat.

      > « Une boulangerie, ce n'est pas seulement un commerce. C'est un endroit où l'on se retrouve. »
      > — Jean Martin

      ## Horaires

      Du lundi au samedi : 6 h 30 – 19 h 30 · Dimanche : 7 h – 13 h
      12 rue de la République, 07700 Bourg-Saint-Andéol
    TEXT
  end
end
