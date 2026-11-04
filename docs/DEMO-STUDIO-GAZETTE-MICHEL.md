# Démonstration du Studio Gazette — présentation client

**Public :** Michel et l'équipe éditoriale.  
**Durée :** environ une minute.  
**Objet :** comprendre le parcours de préparation d'un numéro de la Gazette.

## Le fonctionnement

1. **Créer ou reprendre un numéro.** Depuis « Éditions sauvegardées », créer un nouveau numéro et indiquer le mois.
2. **Renseigner l'identité du journal.** Numéro, territoire, signature éditoriale, logos, mentions légales et encart annonceur.
3. **Choisir un gabarit et importer un article.** Le texte se rédige dans l'éditeur d'articles ; le Studio le compose ensuite pour le papier.
4. **Ajuster la composition.** Ajouter des photos, intertitres, logos de commerces, publicités ou QR codes, puis vérifier l'aperçu A4.
5. **Sauvegarder le brouillon.** L'enregistrement serveur conserve les pages et médias. Après validation, « Figer / publier » rend l'édition consultable et protège ses contenus.
6. **Exporter le numéro.** Contrôler les débordements, puis utiliser « Imprimer / Exporter en PDF A4 ».

Une **visite guidée en six étapes** est accessible dans l'en-tête du Studio, sur la branche de démonstration, grâce au bouton « Visite guidée · 1 min ». Les explications sont facultatives et ne modifient aucune donnée.

## Points de vigilance

- Les exemples vidéo et PDF destinés à Michel sont des **illustrations**, et non des captures d'une édition publiée par le client.
- La Gazette d'octobre 2026 reste la référence graphique : bandeau rose, doubles colonnes, photos dans le texte et publicité en pied de page.
- Le moteur de pagination automatique est expérimental. La rédaction valide les coupures, les pages longues, les images et les QR codes avant impression.
- La police exacte de la manchette du PDF de référence n'est pas reproduite : une police de substitution est utilisée pour le moment.
- La dernière version WSL/Cursor non poussée doit être réconciliée avant fusion ; aucune modification de `main` ni déploiement de production ne sont réalisés par ce lot.

## Accès technique

- Atelier : `/admin/gazette-studio` (accès administrateur).
- Catalogue public : `/gazette` (numéros publiés uniquement).
- Lecture d'un numéro : `/gazette/editions/:id`.
- Contrôle visuel A4 : workflow GitHub Actions `Gazette A4 visual QA`, avec fichiers PDF et captures de preuve.

**Prochaine recette :** composer les deux vraies pages client avec leurs médias, puis les comparer au PDF d'origine et faire valider le résultat avant diffusion.
