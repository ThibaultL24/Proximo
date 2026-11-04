# Première connexion de diffusion autorisée : WordPress

Ce lot constitue la **première intégration exploitable sur une API tierce officielle** de Fenêtre Ouverte, sous réserve d'un compte WordPress autorisé et d'une recette sur le site réel.

## Parcours utilisateur

1. Le commerçant ouvre **Espace commerçant → Atelier de diffusion**.
2. Il ouvre **Blog WordPress — connexion officielle**.
3. Sur **son propre WordPress auto-hébergé**, il se rend dans Utilisateurs → Profil → Mots de passe d'application, puis génère un secret propre à Fenêtre Ouverte, révocable indépendamment de son mot de passe principal.
4. Il saisit exclusivement dans l'application : URL racine HTTPS de son blog, nom d'utilisateur WordPress, mot de passe d'application, et confirme disposer des droits de publication.
5. Rails vérifie l'identité **et la capacité `publish_posts`** via `GET /wp-json/wp/v2/users/me?context=edit`. Il conserve le mot de passe d'application **chiffré** dans `SocialAccount`, à l'abri des réponses API.
6. Il peut cocher **Publier aussi sur ce blog après approbation**.
7. Il soumet sa publication à Jean-Michel. Tant que celle-ci est en attente ou refusée, aucune demande de publication WordPress n'est effectuée.
8. Après validation, `SocialPublishOrchestrator` prépare un `SocialPost` suivi par la tâche `SocialPublishJob`. L'adaptateur WordPress appelle alors `POST /wp-json/wp/v2/posts` avec `status:publish`.
9. L'historique distingue **en attente / en cours / publié / échec / non envoyé / état incertain** ; la réponse WordPress doit contenir un identifiant, un identifiant d'URL stable et le statut `publish`. L'URL publique est affichée après confirmation.
10. En cas d'envoi incertain, le commerçant peut cliquer « Vérifier sur WordPress sans republier » : le serveur recherche l'article par son identifiant d'URL, sans créer un second article.
11. Le commerçant peut déconnecter son blog ; les anciens articles déjà diffusés ne sont pas effacés.

## Ce qui est réellement automatique

- **Oui**, création d'un article public sur un WordPress auto-hébergé compatible REST, autorisé et possédant les permissions nécessaires.
- **Non**, aucune création d'article sur un blog tiers ou un site qui ne fournit pas ses propres identifiants d'application.
- **Non**, aucune automatisation des portails SeLoger/Logic-Immo, ni connexion par défaut à des réseaux sociaux non homologués.
- Les images déjà hébergées par Fenêtre Ouverte peuvent être intégrées au **corps de l'article** si elles disposent d'une URL publique HTTPS ; l'import dans la médiathèque WordPress et la mise en image à la une restent à développer.
- La connexion est désormais refusée lorsque le compte WordPress ne possède pas `publish_posts`.

## Sécurité

- HTTPS et port 443 uniquement, domaine public, URL racine et certificat TLS valide.
- Résolution DNS au moment de chaque requête ; toute résolution locale ou réservée est refusée, y compris en présence d'autres adresses publiques.
- IP TCP épinglée après validation DNS ; pas de redirections suivies ni d'envoi de credentials à un autre hôte.
- Timeout de connexion/lecture, HTTP Basic d'un **Application Password** dédié ; jamais le mot de passe de connexion principal.
- Secrets chiffrés au repos par la couche `PlatformSecrets` héritée de la PR #4.
- Le contenu est HTML-escapé avant l'envoi afin de ne pas publier de scripts arbitraires.
- Les publications WordPress sont identifiées par un `slug` déterministe dépendant de l'agence, du commerçant et de la publication. Une recherche du `slug` précède chaque création.
- Une tâche répétée ne republie pas un post déjà marqué `published` ; un statut `uncertain` interdit toute relance automatique.
- En cas de réponse HTTP ambiguë (timeout, 5xx après POST, JSON illisible), le statut devient `uncertain`. La vérification manuelle consulte uniquement l'API de lecture WordPress. Elle ne crée ni ne modifie de post.
- Le site de destination est fixé au moment de la mise en file : remplacer la connexion du commerçant ne redirige pas une livraison déjà approuvée.
- **Risque résiduel** : un serveur WordPress personnalisé peut modifier les slugs ou répondre de manière incohérente ; si la récupération échoue, l'opérateur doit contrôler manuellement le site avant une nouvelle diffusion.

## Pré-requis de production

- Un vrai blog de test avec un compte disposant de droits de publication, sans envoi de secrets dans un chat ou GitHub.
- Un exécuteur Active Job **durable** (s'il n'est pas présent, une validation ne garantit pas l'envoi externe après redémarrage).
- L'aperçu WordPress, l'URL publiée et le bouton de vérification des états incertains existent maintenant. Un **journal d'audit détaillé et immuable** et le traitement des jobs persistants restent à finaliser.
- Environnements de test dédiés : ne jamais publier un article fictif sur le blog public du client.
- Vérifier politique de conservation, rotation et révocation des mots de passe d'application.
- Une vérification finale de QA du frontend sur mobile et du backend Rails.

## Tests ajoutés

`test/services/social_wordpress_client_test.rb` couvre la validation de l'URL, le refus des IP locales, les permissions, le transport HTTPS, les erreurs de publication et la non-confirmation de succès.

`test/integration/wordpress_distribution_test.rb` couvre l'accès marchand, l'opt-in, la conservation chiffrée des identifiants, l'absence de publication avant modération, l'échappement HTML et la prévention du repost en double.

## Références officielles

- [WordPress : Application Passwords](https://developer.wordpress.org/advanced-administration/security/application-passwords/)
- [WordPress REST : authentification](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)
- [WordPress REST : création d'un post](https://developer.wordpress.org/rest-api/reference/posts/)

## Déploiement et branches

Ce lot est la **PR #5**, empilée sur la PR #4, elle-même dépendante des PR #3 et #2. Il n'a été ni fusionné ni déployé. La branche locale `design/refonte-2026` non poussée doit être reconciliée avant de fusionner vers `main`.
