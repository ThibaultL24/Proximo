import { useEffect, useState } from "react";
import type { Article } from "../../types";
import {
  GazetteSheet, type EditionDraft,
} from "../../components/gazette/gazette-sheet";
import { paginateGazetteArticle } from "../../lib/gazette-auto-pagination";
import { checkGazettePrint } from "../../lib/gazette-print-check";

const svgImage = (heading: string, bg: string): string =>
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400">' +
      '<rect width="700" height="400" fill="' + bg + '"/>' +
      '<circle cx="560" cy="86" r="50" fill="#ffcf68"/>' +
      '<path d="M0 300 Q130 170 260 275 T520 260 T700 270 V400 H0Z" fill="#9dc4aa"/>' +
      '<text x="28" y="365" font-size="30" fill="#143457" font-family="Arial">' +
      heading + '</text></svg>'
  );

const portrait: Article = {
  id: 10, title: "Les Petits Pots de Cé'Do",
  slug: "les-petits-pots", category: "merchant_spotlight",
  excerpt: "Deux familles, deux terres, une même passion…",
  body: [
    "Les producteurs racontent leur histoire. Leur rencontre et le travail de la terre les ont conduits à construire une activité qui valorise les récoltes de proximité.",
    "La saison des fruits rythme leurs journées. Les châtaignes, les pommes et les poires deviennent des recettes simples à partager.",
    "Le soin apporté aux produits commence bien avant la transformation. Il exige du temps, de l'observation et une connaissance précise des arbres.",
    "Chaque petit pot est préparé en petite quantité pour préserver les saveurs, les textures et la qualité des ingrédients.",
    "De l'autre côté du village, une famille cultive encore son jardin. Les récoltes sont distribuées dans la commune et échangées entre voisins.",
    "La démarche poursuit un objectif simple : préserver ce lien vivant entre les producteurs et les habitants.",
    "Les événements locaux permettent de présenter les recettes et de faire découvrir les histoires qui se cachent derrière chaque produit.",
    "Ce projet met en valeur un territoire, ses paysages et la passion de celles et ceux qui le font vivre.",
  ].join("\n\n"),
  cover_image_url: svgImage("Portrait artisan", "#bdd7c5"),
};

const practical: Article = {
  id: 11, title: "RÉNOVATION ÉNERGÉTIQUE : PASSOIRES THERMIQUES",
  slug: "renovation-energetique", category: "local_news",
  excerpt: "Comprendre les enjeux et les solutions",
  body: [
    "On entend régulièrement parler de passoires thermiques. Il est utile de comprendre les facteurs qui influencent la consommation d'énergie d'un logement.",
    "Une isolation insuffisante, des fenêtres anciennes et une ventilation inadaptée peuvent entraîner des pertes importantes de chaleur.",
    "La photographie illustre une intervention d'isolation réalisée par un professionnel sur un logement existant.",
    "La rénovation commence par une évaluation des performances et une hiérarchisation des travaux adaptés à chaque situation.",
    "Pour les propriétaires, il est important de disposer d'informations fiables et de pouvoir anticiper les obligations réglementaires.",
    "Un audit énergétique peut aider à identifier les priorités, les coûts et les bénéfices attendus.",
    "Certaines aides peuvent contribuer au financement, selon les conditions en vigueur et le projet envisagé.",
    "Un conseil auprès d'un organisme spécialisé permet de vérifier la pertinence des solutions avant d'engager des dépenses.",
  ].join("\n\n"),
  cover_image_url: svgImage("Rénovation énergétique", "#d8afb1"),
};

const initial: EditionDraft = {
  issue: "N° 7", edition: "Octobre 2026",
  subtitle: "de Martine et Jean-Michel",
  territory: "SECTEUR DRÔME - ARDÈCHE, VAUCLUSE ET SES ENVIRONS",
  banner: "MARTINE BRANGER - PROPRIÉTÉS PRIVÉES",
  contact: "06 15 92 27 87 - 06 42 40 19 27",
  legal: "RSAC 518821392 · MAQUETTE TECHNIQUE",
  pages: [
    {
      id: 1, template: "portrait", articleId: 10, rubric: "L'histoire des",
      note: "", leftHeading: "Du côté des artisans", rightHeading: "Du côté des producteurs",
    },
    {
      id: 2, template: "pratique", articleId: 11,
      rubric: "COMPRENDRE LES ENJEUX ET LES SOLUTIONS",
      note: "Avant d'engager des travaux, rapprochez-vous d'un conseiller qualifié.",
      leftHeading: "Pourquoi un logement devient-il énergivore ?",
      rightHeading: "Un enjeu pour les propriétaires",
    },
  ],
};
const documents: Record<number, Article> = { 10: portrait, 11: practical };
const headerLogo = svgImage("Propriétés privées · démo", "#e10249");
const footerLogo = svgImage("Annonceur · démo", "#ffffff");
const logo = svgImage("Portrait du commerce", "#f0dfc1");
const extra = svgImage("Produits locaux", "#b7c47b");
const promo = svgImage("Publicité illustrative · démo", "#fbe7ee");

export function GazettePrintFixturePage() {
  const [draft, setDraft] = useState<EditionDraft>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const auto = new URLSearchParams(window.location.search).get("auto") === "1";

  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      if (!auto) { setReady(true); return; }
      try {
        const article: Article = {
          ...portrait,
          body: Array.from({ length: 12 }, (_, i) =>
            "Partie " + (i + 1) + ". " + portrait.body
          ).join("\n\n"),
        };
        documents[10] = article;
        const parts = await paginateGazetteArticle(initial, initial.pages[0], article, {
          headerLogo, footerLogo, spotlightLogo: logo, extraImage: extra,
        });
        if (!cancelled) setDraft({ ...initial, pages: [...parts, initial.pages[1]] });
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Pagination impossible");
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void prepare();
    return () => { cancelled = true; };
  }, [auto]);

  const check = async () => {
    const reason = await checkGazettePrint();
    setError(reason || "OK");
  };

  return (
    <main className="py-8">
      <div className="mx-auto mb-5 max-w-4xl px-4">
        <h1 className="text-2xl font-bold">Recette Gazette A4 · données fictives</h1>
        <p className="mt-2 text-sm">Rendu du composant React réel, sans connexion API ni données client.</p>
        <button data-testid="gazette-check" type="button" onClick={() => void check()}
          className="mt-3 rounded-lg bg-[#e10249] px-4 py-2 font-bold text-white">
          Vérifier l'impression
        </button>
        {error && <p data-testid="gazette-check-result" role="status" className="mt-2 text-sm">{error}</p>}
      </div>
      <div className="gazette-proof-scroller" data-qa-ready={ready ? "true" : "false"}
        data-qa-page-count={draft.pages.length}>
        {draft.pages.map((page) =>
          <GazetteSheet key={page.id} draft={draft} page={page}
            article={documents[page.articleId || 0]}
            headerLogo={headerLogo} footerLogo={footerLogo}
            spotlightLogo={page.id === 1 ? logo : undefined}
            extraImage={page.id === 1 ? extra : undefined}
            promoImage={page.template === "pratique" ? promo : undefined} />
        )}
      </div>
    </main>
  );
}
