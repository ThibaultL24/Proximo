# Gazette — recette A4 et fidélité au PDF d'octobre 2026

## Référence et mesures

Source client : Gazette Octobre 2026 (2)(2).pdf, Canva, deux pages A4, 595,5 × 842,25 pt.
Ces mesures proviennent du PDF fourni, non d'une capture du projet React.

| Élément | PDF de référence | Implémentation PR |
|---|---|---|
| Couleur | #E10249 | #E10249 |
| Format | A4 portrait 210 × 297 mm | A4 |
| Bandeau haut | Environ 40 mm | 40 mm |
| Corps | Deux colonnes, intertitres roses | Deux colonnes, coupure paramétrable |
| Publicité basse | Bandeau rose et logo sur fond blanc | 29 mm + folio |
| Texte | Montserrat 8 pt env., interligne 10,7 pt | Montserrat / CSS |
| Titres | Montserrat gras italique | Montserrat gras italique |
| Manchette | SugoProDisplay | Barlow Condensed (substitution, non identique) |

Autres polices détectées : JosefinSans, AdleryPro, OpenSans.
Ne pas intégrer de polices propriétaires du PDF au dépôt sans licence.

## Page 1 — Portrait

La page prévoit logo annonceur en haut à gauche, photographie paysage en haut
de la colonne droite, logo du commerce et texte à gauche, deux intertitres,
seconde photo en bas de la colonne gauche et pied publicitaire inchangé.

Images nécessaires : logo d'en-tête, logo de pied, couverture d'article,
logo du commerce (emplacement spotlightLogo) et photo supplémentaire
(emplacement extraImage).

## Page 2 — Pratique

La page prévoit titre sur toute la largeur, sous-titre, deux colonnes,
photo au milieu du texte de gauche, intertitres à droite, publicité illustrée
(emplacement promoImage), QR si souhaité et encadré « Bon à savoir ».

## Recette avant fusion

1. Comparer la branche locale WSL/Cursor design/refonte-2026 à la PR avec
   la commande : bash scripts/audit-local-gazette-before-merge.sh
   dans le clone possédant la branche locale. Ne rien fusionner à ce stade.
2. Importer deux articles de démo, choisir les modèles portrait et pratique,
   leurs photos et logos et ajuster la coupure de colonne.
3. Enregistrer puis recharger le brouillon pour vérifier la persistance
   des pages, médias et paramètres.
4. Tenter l'impression avec un texte excessif et une image manquante :
   la vérification préalable doit signaler le problème.
5. Publier, puis comparer l'atelier au lecteur /gazette/editions/:id ;
   vérifier que changer le texte source n'altère pas l'édition publiée.
6. Imprimer en A4, échelle 100 %, marges aucune et arrière-plans graphiques
   activés. Rendre le PDF à 200 dpi pour inspecter chaque page.
7. Comparer les marges, les titres, les photos et la densité du texte aux deux
   pages de référence. Scanner le QR imprimé.
8. Tester les rôles, refus d'accès aux brouillons et archives.

## Limites

- Les gabarits suivent la structure du client, mais ne sont pas pixel-perfect.
  La police de manchette est une substitution.
- Il manque toujours une pagination automatique typographique fiable :
  le choix et l'ordre des pages ainsi que la coupure des colonnes sont manuels.
- L'export PDF passe encore par l'impression du navigateur.
- Une recette graphique en navigateur connecté à une base de démonstration est
  indispensable. Les builds et tests Rails ne prouvent pas la fidélité visuelle.
- Ne pas écraser la version WSL/Cursor locale sans comparaison.
