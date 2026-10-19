# Rappel, défi du jour, album, bilan parent (0.10)

Tout reste local : aucune donnée n'est envoyée, aucune série à ne pas casser, rien ne se perd si on saute un jour.

- **Luna te repose une question** (`mode: "review"`) : jusqu'à 6 notions déjà réussies seule, dont le rappel espacé est échu. Elle apparaît sur l'accueil seulement s'il y a quelque chose à revoir.
- **Défi du jour** (`mode: "daily"`) : 3 petits défis, un seul par jour (`daily = {day, done}`, jour local de l'appareil). Récompense identique à une mission.
- **Cadeau de chambre** : toutes les 5 missions terminées, l'objet de chambre le moins cher pas encore possédé est offert et annoncé en fin de mission (`newRoomGift`, effacé dès qu'on quitte l'écran).
- **Mon album** : 25 autocollants **calculés** à partir de la sauvegarde (missions, chapitres, jardin, compagnons, chambre, notions, défi du jour) ; seuls ceux déjà vus sont mémorisés (`stickersSeen`) pour afficher « Nouveau ! » une fois.
- **Plantes dessinées** : les 15 plantes du jardin sont des SVG locaux (`plant-art.js`) au lieu d'emojis.
- **Chambre vivante** : le compagnon respire et, entre 19 h et 7 h, la chambre s'assombrit et la lampe équipée s'allume (désactivé par « Animations douces »).
- **Espace parent** : bilan de la semaine (défis par jour sur 7 jours, notions solides / à reprendre tranquillement, sans note), longueur de mission (5, 8 ou 12 défis), texte plus grand, voix plus lente.
- **Sauvegarde** : après 3 missions, un rappel doux invite un adulte à exporter (toutes les 2 semaines ; « Plus tard » le masque 7 jours). L'export enregistre sa date (`settings.lastExport`).
- **Lecture vocale** : déjà présente sur les consignes, leçons et chapitres ; la voix plus lente s'applique partout.

Champs de sauvegarde ajoutés, tous facultatifs et validés : `settings.length/textSize/slow/lastExport/exportSnooze`, `daily`, `stickersSeen`, `newRoomGift`.

Limites : l'agrandissement « texte plus grand » s'ajoute à celui des tablettes ; les textes et dessins n'ont pas été validés sur une vraie tablette ; le bilan de la semaine n'a de sens qu'avec quelques défis par notion.
