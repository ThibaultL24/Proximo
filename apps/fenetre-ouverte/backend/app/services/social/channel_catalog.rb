# Inventaire produit : une présence dans la liste NE signifie PAS que
# Fenêtre Ouverte peut poster automatiquement sur ce réseau.
module Social
  module ChannelCatalog
    CHANNELS = [
      { id: "facebook", label: "Facebook Pages", mode: "oauth", scope: "pages", notes: "Pages gérées, permissions Meta et validation de l'application nécessaires" },
      { id: "instagram", label: "Instagram", mode: "oauth", scope: "professional", notes: "Compte professionnel, médias publics HTTPS et permissions Meta nécessaires" },
      { id: "tiktok", label: "TikTok", mode: "oauth", scope: "approved_app", notes: "Compte autorisé, média et audit TikTok nécessaires pour le public" },
      { id: "linkedin", label: "LinkedIn", mode: "planned", scope: "company", notes: "API Posts récente et autorisations de page, ancien adaptateur à migrer" },
      { id: "threads", label: "Threads", mode: "planned", scope: "account", notes: "OAuth et API Threads à intégrer après validation" },
      { id: "pinterest", label: "Pinterest", mode: "planned", scope: "boards", notes: "App approuvée, images et tableau du compte requis" },
      { id: "youtube", label: "YouTube", mode: "planned", scope: "channel", notes: "Vidéos et API quota YouTube, pas un post texte" },
      { id: "bluesky", label: "Bluesky", mode: "planned", scope: "account", notes: "AT Protocol, authentification du compte à intégrer" },
      { id: "mastodon", label: "Mastodon", mode: "planned", scope: "account", notes: "OAuth par instance, périmètre write:statuses" },
      { id: "x", label: "X", mode: "paid", scope: "account", notes: "API facturée à l'utilisation, activation uniquement après accord et budget" },
      { id: "wordpress", label: "WordPress", mode: "partner", scope: "own_blog", notes: "Connexion officielle à votre site WordPress auto-hébergé avec mot de passe d’application révocable" }
    ].freeze

    module_function

    def all
      CHANNELS.map(&:dup)
    end
  end
end
