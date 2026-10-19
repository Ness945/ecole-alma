# Ma chambre

Pièce décorable de l'aventurière (route `room`, 5ᵉ raccourci de l'accueil et tuile « Ma chambre » toujours ouverte dans les pièces du château).

- **48 objets, 11 emplacements** : murs (8 choix avec le fond par défaut), sol, lit, tapis, fenêtre, lumières, étagères, bureau, jouets, décor mural, plantes. Chaque emplacement a au moins 3 choix payants (8 à 45 pièces).
- **Aperçu libre** : toucher un objet le montre dans la chambre sans rien dépenser ; acheter puis équiper l'enregistre. « Vider ma chambre » retire tout mais garde la collection.
- **Compagnon** : le compagnon choisi dort sur le tapis.
- **Sauvegarde** : champ optionnel `rpg.room` (11 emplacements, `null` = défaut). Les anciennes sauvegardes sans chambre restent valides et sont complétées au chargement ; un objet non possédé ou posé sur le mauvais emplacement est refusé.
- **Dessin** : `frontend/js/room-art.js`, SVG local sans identifiants ; l'icône de la boutique est un recadrage du même dessin que la scène. Disponible hors ligne (cache `content-v15`).
- **Limites** : dessin fait à la main, non validé sur une vraie tablette ; les objets ne se déplacent pas (un emplacement fixe par type).
