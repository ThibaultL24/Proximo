/**
 * Vérifications avant l'impression. Il s'agit d'un contrôle des éléments
 * réellement composés par le navigateur, pas d'un moteur de pagination.
 */
export async function checkGazettePrint(): Promise<string | null> {
  if (document.fonts) await document.fonts.ready;

  const sheets = Array.from(
    document.querySelectorAll<HTMLElement>(".gazette-proof-page"),
  );
  if (sheets.length === 0) return "Aucune page de Gazette à imprimer.";

  for (const [index, sheet] of sheets.entries()) {
    const page = index + 1;
    const images = Array.from(sheet.querySelectorAll<HTMLImageElement>("img"));

    for (const img of images) {
      if (!img.complete) {
        try {
          await img.decode();
        } catch {
          return "Page " + page + " : une photographie ou un logo n'a pas pu être chargé.";
        }
      }
      if (!img.naturalWidth) {
        return "Page " + page + " : une photographie ou un logo est introuvable.";
      }
    }

    const content = sheet.querySelector<HTMLElement>(".gazette-reference-content");
    const footer = sheet.querySelector<HTMLElement>(".gazette-reference-footer");
    if (!content || !footer) {
      return "Page " + page + " : structure de mise en page incomplète.";
    }

    if (content.scrollHeight > content.clientHeight + 2) {
      return "Page " + page + " : le texte dépasse de la zone réservée au contenu A4.";
    }

    const footerTop = footer.getBoundingClientRect().top;
    const printable = Array.from(content.querySelectorAll<HTMLElement>(
      ".gazette-article-paragraph, .gazette-article-subheading, img, .gazette-practical-note",
    ));

    if (printable.some((element) => element.getBoundingClientRect().bottom > footerTop - 2)) {
      return "Page " + page + " : un élément risque de recouvrir le bandeau publicitaire.";
    }
  }
  return null;
}
