# Aucun flux contractuel n'est activé par défaut.
# Un export générique ne doit jamais être présenté comme un flux SeLoger valide.
class PropertyPortalCatalog
  PORTALS = [
    { id: "seloger", label: "SeLoger", mode: "contract", notes: "Accord commercial et format de flux agréé requis" },
    { id: "logic_immo", label: "Logic-Immo", mode: "contract", notes: "Accord ou prestataire de multidiffusion agréé requis" },
    { id: "bien_ici", label: "Bien'ici", mode: "contract", notes: "Vérifier le contrat de diffusion professionnel" },
    { id: "leboncoin", label: "Leboncoin Immobilier", mode: "contract", notes: "Diffusion professionnelle soumise aux offres du portail" },
    { id: "figaro", label: "Figaro Immobilier", mode: "contract", notes: "Accès par contrat ou agrégateur partenaire" },
    { id: "green_acres", label: "Green-Acres", mode: "contract", notes: "Conditions de multidiffusion à négocier" },
    { id: "paruvendu", label: "ParuVendu", mode: "contract", notes: "Vérifier les offres de diffusion professionnelle" },
    { id: "diffuze", label: "Diffuze", mode: "paid_partner", notes: "Prestataire de multidiffusion payant, accord d'intégration à négocier" },
    { id: "wordpress", label: "WordPress (blog autorisé)", mode: "owner_blog", notes: "API officielle seulement pour les blogs que l'agence contrôle ou avec autorisation" },
    { id: "partner_blogs", label: "Blogs partenaires", mode: "editorial", notes: "Proposer un article original à un éditeur consentant, sans publication automatique" }
  ].freeze

  def self.all
    PORTALS.map(&:dup)
  end
end
