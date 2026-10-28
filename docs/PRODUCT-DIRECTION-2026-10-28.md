# Direction produit et design — 28 octobre 2026

## Décision

Deux applications séparées, chacune avec son authentification et sa base.
La boutique est **hors du périmètre de cette version** : liens et routes d'achat retirés des interfaces et API copiées. Conserver le code historique pour une extraction ultérieure contrôlée, sans nouveau développement e-commerce.

## Fenêtre Ouverte : communauté locale et commerce de proximité

- Public : habitants, commerçants, rédaction locale.
- Ton : chaleureux, accessible et visuel ; Bleu profond #093969, bleu d'accent #0B4C93, jaune #FFBD24, orange #F08226, blanc. Cartes arrondies, photographies de l'Ardèche et des villages réutilisées depuis `frontend/public/territory`.
- La homepage met en avant le flux réel d'articles et publications validés ; fiches commerçantes, QR codes et découverte des communes.
- Le commerçant gère la fiche qu'il présente au public. Les changements de texte, de logo et de photos sont enregistrés comme **révisions** : l'ancienne fiche reste visible jusqu'à approbation.
- Les publications commerciales sont `pending_review` à la création, invisibles publiquement ; la modération peut approuver ou rejeter avec motif. La syndication vers les comptes connectés se produit seulement après approbation et si demandée par le commerçant.
- Le rôle admin dispose de `/admin/moderation` et `/admin/gazette-studio`.
- Studio Gazette v0 : sélection d'un article, édition d'intitulé, numéro, mois, aperçu d'une page A4 à deux colonnes, impression ou PDF du navigateur.
- Gazette octobre 2026 fournie comme référence : page 1 portrait des Petits Pots de Cé'Do (Aizac et Saint-Remèze) ; page 2 article pratique sur la rénovation énergétique ; photos, titres hiérarchisés, pied récurrent et deux colonnes.
- Les logos fournis dans la conversation servent à définir la direction bleu/jaune/orange ; **les PNG finaux n'ont pas encore été intégrés aux assets GitHub**. L'icône d'en-tête reste temporairement une interprétation SVG.

### Modération : limites / sécurité

- Les anciens points d'accès des publications et des fiches doivent encore être audités globalement ; ce lot protège les nouveaux flux commerçants, pas une suppression intégrale du monolithe.
- L'interface de révision des photos n'affiche pas encore l'aperçu détaillé des fichiers joints à la modération. Ne pas approuver un média impossible à vérifier visuellement.
- En cas d'échec du réseau social externe, une publication interne peut être approuvée sans que sa diffusion externe ait réussi. Prévoir retry, audit détaillé et mode d'emploi de chaque fournisseur.
- Pas de modération automatisée des commentaires des habitants ni de notifications à ce stade.
- L'admin doit avoir une politique éditoriale explicite et traçable, et un système de contestation ou de correction lors d'un futur lot.

## Proximo : SaaS immobilier

- Direction : noir #0A0B0B, blanc, jaune néon #EAFA64 ; cartes glass translucides et effets lumineux sobres.
- Page commerciale distincte, affichage de trois **tarifs indicatifs de maquette**, sans souscription : Essentiel 49 €, Professionnel 129 €, Réseau 249 € HT/mois. Valider la grille tarifaire avant le lancement.
- Vue de démonstration / espace connecté `/espace` : organisations et fiches clients, avec lien `/dossiers/nouveau?organization_id=...`.
- `ClientDossier` : données d'identité, projet achat/vente/location/investissement, zone, budget, cahier des charges, référence de mandat et pièces jointes. Droits réservés aux managers/owners de l'organisation, consentement déclaré à la création.
- État du mandat initial : `non_recu`. Aucune signature électronique, vérification de conformité ou diffusion juridique automatisée.
- Des contrôles de sécurité et de protection des données sont nécessaires avant utilisation sur de vraies données clients, notamment autorisation d'accès aux documents et politique de conservation.

### Multidiffusion d'annonces : pas encore intégrée

- L'API SeLoger/AVIV destinée aux partenaires requiert un processus d'intégration et des identifiants accordés par le fournisseur : https://www.developers.aviv-group.com/guides/how-to-onboard-on-aviv-apis/onboarding-path-french-apis-seloger-services
- Étape suivante : PropertyListing + champs obligatoires, mandat signé et valide, dossier DPE et diagnostics, validation humaine, adaptateurs d'export, journal des publications et retours fournisseurs.
- Ne jamais annoncer dans l'interface que les annonces sont réellement publiées sur SeLoger ou d'autres portails tant que les connecteurs ne sont pas autorisés, testés et actifs.
- Les mandats de vente écrits et signés sont notamment obligatoires avant la publicité : https://www.service-public.gouv.fr/particuliers/vosdroits/F2954

## Contrôles avant fusion

1. CI GitHub Actions entièrement verte (Rails x2, build frontend x2, configuration locale).
2. Tester la modération de publication, l'absence dans le feed avant validation, la propagation après validation et les refus inter-territoires.
3. Tester le dépôt de révision de fiche, son refus/approbation et la présence effective des médias.
4. Vérifier en local les deux pages d'accueil et la connexion aux deux applications indépendantes.
5. Tester le formulaire de dossier et l'isolation des données, ne jamais uploader de vrais documents pendant la prévisualisation.
6. Auditer toutes les anciennes routes du monolithe et supprimer le code métier étranger à chaque application.
7. Valider l'intégration finale des logos en PNG et la direction artistique avec le client.

Le projet demeure une PR brouillon et n'est **pas prêt pour une fusion vers main**.
