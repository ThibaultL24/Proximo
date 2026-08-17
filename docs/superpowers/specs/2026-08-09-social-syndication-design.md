# Design — Syndication multi-réseaux commerçants

Date: 2026-08-09  
Produit: Fenêtre Ouverte (07700)

## Objectif

Permettre à un commerçant abonné de publier **en une fois** sur le fil Fenêtre Ouverte et sur les réseaux connectés : **Facebook**, **Instagram**, **LinkedIn** (pas X, pas TikTok en V1).

Sans clés API : mode **démo** explicite. Avec clés dans `.env` : OAuth + publication live (tests réels).

## Décisions produit

| Sujet | Décision |
|--------|----------|
| Réseaux V1 | Facebook, Instagram, LinkedIn |
| Approche | Adapters par provider + OAuth branchable ; démo si clés absentes |
| Signature | Texte en fin de message : `— via Fenêtre Ouverte · 07700` (+ lien fiche si dispo) |
| Image | Optionnelle ; pas de bandeau image FO généré |
| Accès | Abonnement commerçant actif requis pour publier / syndiquer |

## Parcours commerçant

1. **Connecter** FB / IG / LinkedIn depuis l’espace Publier (état : non connecté / démo / connecté live / erreur).
2. **Rédiger** : rubrique, texte, photo optionnelle.
3. **Choisir** les réseaux cochés parmi ceux connectés (+ fil FO toujours publié).
4. **Publier** : un submit → fil + syndication sélectionnée.
5. **Historique** : statut par réseau (publié / échec / démo / ignoré).

## Architecture

```
UI Publier → POST /merchant/publications { syndicate, providers[], body, image? }
           → PublicationCreator (fil FO)
           → SocialPublishOrchestrator
                → FacebookAdapter | InstagramAdapter | LinkedInAdapter
                     → DemoClient (token "demo" ou clés absentes)
                     → Live API (clés présentes + token OAuth)

UI Connecter → GET authorize URL → callback OAuth → social_accounts
             → ou POST demo connect si provider non configuré
```

### Composants backend

- `SocialSignature` — append signature FO au body avant envoi réseau (le fil FO garde le body brut).
- `Social::Providers` — liste V1 + limites de caractères.
- `Social::OAuth::*` — authorize URL + callback (Meta pour FB/IG, LinkedIn).
- `Social::Adapters::*` — `publish(account:, body:, image_url:)` → statut.
- Refactor `SocialPublisher` pour déléguer aux adapters (garder orchestrateur existant).
- Config env :
  - `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`
  - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
  - `FRONTEND_URL` pour retours UI

### Composants frontend

- Panneau comptes : Connecter / Déconnecter + badge Démo | Connecté.
- Formulaire : checkboxes providers connectés, `syndicate: true` si ≥1 coché.
- Historique : badges par `social_posts[]`.
- Retirer X / TikTok de l’UI commerçant (constantes `SOCIAL_PROVIDERS`).

## OAuth (prêt pour clés)

- **Meta** : un flux pour Facebook Page + Instagram Business lié à la page ; scopes pages + instagram_content_publish.
- **LinkedIn** : OAuth 2 + partage organization ou membre (V1 : profil/membre ou page org si dispo).
- Callbacks API Rails → stockent `access_token`, `refresh_token`, `external_id`, `account_name`, `status: connected`.
- Si config manquante : endpoint `POST .../social_accounts` crée compte `access_token: "demo"`.

## Gestion d’erreurs

- Compte non connecté → `skipped`.
- API live échoue → `failed` + `error_message` ; les autres réseaux continuent.
- Partial success : `syndicated = true` si ≥1 published (comportement actuel).
- UI : message global + détail par réseau.

## Hors scope V1

- X / TikTok
- Bandeau image FO généré
- Programmation / file async (publication synchrone suffisante en V1)
- Édition / suppression des posts externes après coup

## Critères de succès

1. Commerçant connecte FB, IG, LinkedIn (démo sans clés).
2. Une publication avec 3 cases cochées crée 3 `social_posts` + entrée fil.
3. Signature présente sur les posts réseaux, absente du body stocké fil (ou claire séparation preview).
4. Photo optionnelle transmise aux adapters quand présente.
5. Avec clés Meta/LinkedIn : même parcours en live sans changer l’UI.
