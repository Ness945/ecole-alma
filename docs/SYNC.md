# Synchronisation chiffrée entre appareils (v0.15)

Facultative, **désactivée par défaut**. Sans elle, l'application reste 100 % locale. Avec elle, la
progression est chiffrée sur l'appareil puis déposée sur un petit service que vous hébergez vous-même.

## Ce qui quitte l'appareil
- Uniquement un texte chiffré (AES-256-GCM) et un identifiant opaque dérivé du code famille.
- Le **code famille** (20 caractères, ~100 bits) ne quitte jamais l'appareil ; il est dérivé par PBKDF2-SHA-256
  (200 000 itérations) en un identifiant (64 hex) et une clé. L'identifiant ne permet pas de retrouver la clé.
- Le service ne peut lire ni le prénom, ni les réponses, ni les étoiles. Il connaît seulement la taille et l'heure d'écriture.
- Qui détient le code peut lire et écrire : ne le publiez pas. Perdre le code = impossible de déchiffrer (l'export JSON reste la sauvegarde de secours).

## Déployer le service (une fois, gratuit)
1. Compte Cloudflare gratuit → *Workers & Pages* → *KV* → créer un espace nommé `academie-sync`, copier son ID.
2. Dans `worker/wrangler.toml`, remplacer `REMPLACER_PAR_L_ID_DU_KV` par cet ID.
3. `cd worker && npx wrangler deploy` (connexion au compte demandée). L'adresse affichée ressemble à
   `https://academie-sync.<compte>.workers.dev`.
4. Facultatif : variable `ALLOW_ORIGIN = https://ness945.github.io` pour n'accepter que l'application.

## Utiliser
Espace parent → *Synchronisation chiffrée* : saisir l'adresse, **Créer un code** (le noter), **Activer**.
Sur chaque autre appareil : même adresse, même code. L’envoi est automatique : 4 s après chaque réponse, et tout de suite à la fin d’une mission. La réception se fait au lancement, au retour sur l’app, au retour du réseau et toutes les 60 s (page visible, hors séance). Le pied de page affiche « ☁️ Synchronisé à … ». Hors ligne, rien ne change : la reprise est automatique.

## Fusion
La sauvegarde la plus avancée (aventures, réponses, objets ; à égalité la plus récente) sert de base, mais on ne perd jamais :
- l'historique de réponses (union, 1000 dernières),
- les preuves par notion (la notion la plus récemment travaillée est conservée),
- les aventures terminées, les objets possédés (réserve + boutique de la chambre).
Limite connue : si les deux appareils jouent *en même temps* avant de se synchroniser, les étoiles/graines
et l'état du jardin suivent l'appareil le plus récent. Une fusion qui produirait une sauvegarde invalide est
abandonnée au profit de la version la plus récente. Une synchro n'est jamais appliquée pendant une séance en cours.

## Tests
`tests/sync.test.js` (chiffrement, fusion, service simulé de bout en bout, refus de conflit) et
`tests/sync-browser.mjs` (deux profils, vrai service local, hors ligne, désactivation).
