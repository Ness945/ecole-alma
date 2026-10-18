# GitHub Pages

Le workflow `.github/workflows/pages.yml` publie uniquement `frontend/`, après `npm test` et `npm run check`. Chaque envoi sur `master` déclenche la publication. Dans Settings → Pages, la source doit être GitHub Actions.

Adresse prévue : https://ness945.github.io/ecole-alma/

Les chemins relatifs, le manifeste et le service worker acceptent le sous-chemin `/ecole-alma/` et restent compatibles avec localhost. Le cache est isolé par périmètre du service worker.

Le dépôt est actuellement privé. L’API GitHub a refusé l’activation Pages le 18 octobre 2026 : l’offre actuelle ne prend pas en charge Pages pour ce dépôt. La publication attend le choix du propriétaire concernant la visibilité du dépôt ou une offre compatible.

Les sauvegardes restent locales au navigateur et à l’adresse du site. Pour reprendre la progression de localhost, utiliser **Espace parent → Exporter la sauvegarde JSON**, puis importer ce fichier sur le site en ligne. Les sauvegardes ne sont pas envoyées à GitHub.

Vérification avant publication : `tests/pages-browser.mjs` sert le jeu sous `/ecole-alma/` dans un profil Edge isolé et vérifie chargement, images, manifeste et mission après rechargement hors ligne.
