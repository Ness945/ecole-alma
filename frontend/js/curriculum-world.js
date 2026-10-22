import { parseBank, fromBank } from "./curriculum-core.js";

const banks = {
  body: parseBank([
    "Avec quel sens goûte-t-on un gâteau ?|le goût|la vue|l’ouïe|On goûte avec la langue : c’est le sens du goût.",
    "Quel organe nous permet de voir ?|les yeux|les oreilles|le nez|On voit avec les yeux.",
    "Quel organe nous permet d’entendre ?|les oreilles|les yeux|la langue|On entend avec les oreilles.",
    "Quel organe nous permet de sentir une odeur ?|le nez|la main|l’oreille|On sent avec le nez.",
    "Quel sens utilise-t-on pour savoir si c’est chaud ou doux ?|le toucher|la vue|l’odorat|On touche avec la peau.",
    "Combien avons-nous de sens ?|5|3|7|Vue, ouïe, odorat, goût et toucher : cinq sens.",
    "Quelle partie du corps pompe le sang ?|le cœur|le cerveau|l’estomac|Le cœur envoie le sang dans tout le corps.",
    "Quelle partie du corps nous aide à penser ?|le cerveau|le cœur|le pied|Le cerveau commande tout le corps.",
    "Les os du corps forment …|le squelette|la peau|les muscles|Tous les os ensemble s’appellent le squelette.",
    "Avec quoi respire-t-on ?|les poumons|les os|les dents|L’air entre dans les poumons.",
    "À quoi servent les dents ?|à mâcher les aliments|à voir|à entendre|Les dents coupent et broient la nourriture.",
    "Quelle partie du corps recouvre tout notre corps ?|la peau|les os|les dents|La peau nous protège.",
  ]),
  health: parseBank([
    "Que faut-il faire avant de manger ?|se laver les mains|courir|crier|Se laver les mains évite les microbes.",
    "Combien de fois par jour se brosse-t-on les dents ?|2 fois|1 fois|5 fois|Matin et soir : deux fois par jour.",
    "Quelle boisson est la meilleure pour la santé ?|l’eau|le soda|le sirop|L’eau est la meilleure boisson.",
    "Combien de fruits et légumes conseille-t-on de manger par jour ?|5|1|12|« 5 fruits et légumes par jour » est un bon repère.",
    "Quand on tousse, on met sa main …|devant sa bouche|sur ses yeux|dans ses poches|On protège les autres des microbes.",
    "Pour être en forme, il faut …|bien dormir|veiller très tard|ne jamais bouger|Le sommeil permet au corps de se reposer.",
    "Quel aliment est bon pour la santé ?|une pomme|une sucette|un bonbon|Les fruits donnent des vitamines.",
    "Bouger chaque jour permet de …|rester en forme|se fatiguer pour rien|grandir moins|Le sport aide le corps et le cœur.",
    "Quand on est malade, on peut …|se reposer et voir un médecin|manger beaucoup de bonbons|sortir sans manteau|Le repos et le médecin aident à guérir.",
    "Où range-t-on les médicaments ?|hors de portée des enfants|sur la table|dans le cartable|Les médicaments peuvent être dangereux : un adulte s’en occupe.",
  ]),
  animals_groups: parseBank([
    "Le chat est un …|mammifère|oiseau|poisson|Le chat a des poils et allaite ses petits.",
    "L’aigle est un …|oiseau|mammifère|insecte|L’aigle a des plumes et des ailes.",
    "Le saumon est un …|poisson|mammifère|reptile|Le saumon vit dans l’eau et respire avec des branchies.",
    "La coccinelle est un …|insecte|oiseau|poisson|Un insecte a six pattes.",
    "Le serpent est un …|reptile|insecte|mammifère|Le serpent a la peau couverte d’écailles.",
    "La baleine est un …|mammifère|poisson|oiseau|Elle vit dans l’eau, mais elle allaite son petit : c’est un mammifère.",
    "Combien de pattes a un insecte ?|6|4|8|Un insecte a toujours six pattes.",
    "Quel animal a des plumes ?|le moineau|le chien|le requin|Seuls les oiseaux ont des plumes.",
    "Quel animal pond des œufs ?|la poule|la vache|le chien|La poule pond des œufs.",
    "Quel animal allaite ses petits ?|la vache|la poule|la grenouille|La vache est un mammifère.",
    "La grenouille vit d’abord dans l’eau, puis aussi sur terre. C’est un …|amphibien|oiseau|mammifère|On appelle amphibiens les animaux qui vivent dans les deux milieux.",
    "Quel animal n’est pas un insecte ?|l’araignée|la fourmi|l’abeille|L’araignée a huit pattes : ce n’est pas un insecte.",
  ]),
  diet: parseBank([
    "Le lapin mange des plantes. C’est un …|herbivore|carnivore|omnivore|Herbivore : qui mange des plantes.",
    "Le lion mange de la viande. C’est un …|carnivore|herbivore|omnivore|Carnivore : qui mange de la viande.",
    "L’ours brun mange de tout. C’est un …|omnivore|carnivore|herbivore|Omnivore : qui mange de tout.",
    "Un animal qui mange seulement des plantes est …|herbivore|carnivore|omnivore|Herbivore.",
    "Un animal qui mange de la viande est …|carnivore|herbivore|omnivore|Carnivore.",
    "La vache est …|herbivore|carnivore|omnivore|Elle mange de l’herbe.",
    "Le loup est …|carnivore|herbivore|omnivore|Il chasse d’autres animaux.",
    "Le cochon est …|omnivore|carnivore|herbivore|Il mange de tout.",
    "Le requin est …|carnivore|herbivore|omnivore|Il mange des poissons.",
    "La chèvre est …|herbivore|carnivore|omnivore|Elle broute de l’herbe et des feuilles.",
    "L’aigle est …|carnivore|herbivore|omnivore|Il attrape des petits animaux.",
    "L’être humain est …|omnivore|carnivore|herbivore|Nous mangeons des plantes et de la viande ou du poisson.",
  ]),
  plants: parseBank([
    "Quelle partie fixe la plante dans la terre ?|les racines|les feuilles|les fleurs|Les racines tiennent la plante et boivent l’eau.",
    "Quelle partie porte les feuilles ?|la tige|la racine|la graine|La tige soutient la plante.",
    "De quoi une plante a-t-elle besoin pour grandir ?|d’eau et de lumière|de bonbons|de bruit|Sans eau et sans lumière, elle ne peut pas grandir.",
    "Que devient une graine qui germe ?|une petite plante|une pierre|un animal|La graine donne une nouvelle plante.",
    "Quelle partie de la plante devient un fruit ?|la fleur|la racine|la tige|Après la fleur, le fruit se forme.",
    "Où trouve-t-on les graines d’une pomme ?|dans le fruit|dans la racine|dans la tige|Les graines sont à l’intérieur du fruit.",
    "Quel arbre perd ses feuilles en automne ?|le chêne|le sapin|le houx|Le chêne perd ses feuilles à l’automne.",
    "Qu’est-ce qui sort d’abord d’une graine ?|la racine|la fleur|le fruit|La racine apparaît la première.",
    "Que doit-on faire pour qu’une plante en pot reste en vie ?|l’arroser|la boire|la couper|Elle a besoin d’eau.",
    "À quoi servent les feuilles ?|à capter la lumière|à boire dans la terre|à faire du bruit|Les feuilles captent la lumière du soleil.",
  ]),
  habitats: parseBank([
    "Où vit un poisson ?|dans l’eau|dans le désert|dans un arbre|Le poisson respire dans l’eau.",
    "Où vit l’ours polaire ?|sur la banquise|dans le désert|dans la forêt tropicale|Il vit près du pôle Nord, sur la glace.",
    "Où vit le chameau ?|dans le désert|sur la banquise|dans la mer|Il résiste à la chaleur et à la soif.",
    "Où vit une vache ?|dans un pré|dans un nid|dans un terrier|La vache broute l’herbe dans les prés.",
    "Où vit un singe ?|dans la forêt tropicale|sur la banquise|dans la mer|Il grimpe aux arbres.",
    "Où habite un renard ?|dans un terrier|dans une ruche|dans un aquarium|Le renard creuse un terrier.",
    "Où vit l’abeille ?|dans une ruche|dans un terrier|dans l’eau|Les abeilles vivent dans une ruche.",
    "Où vit le manchot ?|près du pôle Sud|dans le désert|dans la jungle|Le manchot vit dans les régions très froides du sud.",
    "Où dort l’écureuil ?|dans un arbre|dans la mer|dans le sable|Son nid est dans les branches.",
    "Où vit l’oiseau ?|dans un nid|dans un terrier|dans l’eau|Les oiseaux construisent des nids.",
  ]),
  growth: parseBank([
    "Quel est le petit de la poule ?|le poussin|le chiot|le veau|Le poussin sort d’un œuf.",
    "Une chenille devient …|un papillon|une abeille|une fourmi|La chenille se transforme en papillon.",
    "Un têtard devient …|une grenouille|un poisson|un serpent|Le têtard grandit et devient grenouille.",
    "Quel est le petit du chat ?|le chaton|le chiot|le veau|Chaton.",
    "Quel est le petit du chien ?|le chiot|le chaton|le poussin|Chiot.",
    "Quel est le petit de la vache ?|le veau|le poulain|l’agneau|Veau.",
    "Quel est le petit du cheval ?|le poulain|le veau|le chiot|Poulain.",
    "Quel est le petit du mouton ?|l’agneau|le veau|le poulain|Agneau.",
    "Quelle est la suite : bébé, enfant, … ?|adulte|poussin|chenille|On grandit : bébé, enfant, adulte.",
    "Qui grandit : une pierre ou un lapin ?|un lapin|une pierre|les deux|Les êtres vivants grandissent.",
    "Quel est le petit du cochon ?|le porcelet|le veau|l’agneau|Porcelet.",
    "Quel est le petit de l’oiseau ?|l’oisillon|le poulain|le chiot|Oisillon.",
  ]),
  matter: parseBank([
    "L’eau qui gèle devient …|de la glace|de la vapeur|du sable|À 0 °C, l’eau liquide devient solide.",
    "La glace qui chauffe devient …|de l’eau|du sable|de l’air|La glace fond et redevient de l’eau.",
    "L’eau qui bout devient …|de la vapeur|de la glace|du sable|L’eau qui bout se transforme en vapeur (gaz).",
    "Que mesure un thermomètre ?|la température|le poids|la longueur|Le thermomètre indique s’il fait chaud ou froid.",
    "À quelle température l’eau gèle-t-elle ?|0 °C|10 °C|100 °C|À 0 °C, l’eau devient glace.",
    "À quelle température l’eau bout-elle ?|100 °C|0 °C|50 °C|À 100 °C, l’eau bout.",
    "L’eau du robinet est …|liquide|solide|gazeuse|On peut la verser : elle est liquide.",
    "Le bois est …|solide|liquide|gazeux|On peut le tenir en main et il garde sa forme.",
    "L’air est …|un gaz|un solide|un liquide|On ne le voit pas, mais il est autour de nous.",
    "Un glaçon posé au soleil …|fond|gèle|grossit|La chaleur le fait fondre.",
    "En hiver, la température est plutôt …|basse|haute|nulle|Il fait froid : température basse.",
    "Quand il pleut, l’eau qui tombe est …|liquide|solide|gazeuse|La pluie est de l’eau liquide.",
  ]),
  electricity: parseBank([
    "Quel objet fonctionne avec de l’électricité ?|une lampe|une pierre|un livre|Une lampe s’allume grâce au courant.",
    "Une pile fournit …|de l’énergie électrique|de l’eau|de la glace|La pile fait fonctionner de petits objets.",
    "Pour allumer une ampoule avec une pile, le circuit doit être …|fermé|ouvert|coupé|Le courant doit pouvoir faire tout le tour.",
    "Peut-on mettre un doigt ou un objet dans une prise ?|non|oui|parfois|C’est très dangereux : on ne touche jamais aux prises.",
    "Quel matériau laisse passer le courant ?|le métal|le bois|le plastique|Le métal conduit l’électricité.",
    "À quoi sert un interrupteur ?|ouvrir ou fermer le circuit|faire du bruit|chauffer|Il laisse passer ou coupe le courant.",
    "Peut-on toucher un appareil électrique avec les mains mouillées ?|non|oui|si c’est petit|L’eau conduit l’électricité : c’est dangereux.",
    "Pour des expériences à l’école, on utilise …|des piles|la prise du mur|un fil dénudé|Les piles plates sont sans danger.",
    "Quel matériau ne laisse pas passer le courant ?|le plastique|le fer|le cuivre|Le plastique est un isolant.",
  ]),
  materials: parseBank([
    "En quelle matière est une vitre ?|le verre|le bois|la laine|Le verre est transparent.",
    "En quelle matière est une casserole ?|le métal|le papier|la laine|Le métal résiste à la chaleur.",
    "En quelle matière est une chaise en bois ?|le bois|le verre|le papier|Le bois vient des arbres.",
    "Un pull chaud est souvent fait en …|laine|verre|métal|La laine vient des moutons.",
    "Quelle matière est transparente ?|le verre|le bois|le métal|On voit à travers le verre.",
    "Quelle matière vient des arbres ?|le papier|le verre|le plastique|On fabrique le papier avec du bois.",
    "Quelle matière flotte sur l’eau ?|le bois|le caillou|le fer|Le bois flotte, le caillou coule.",
    "Quelle matière est dure et froide ?|le métal|la laine|le coton|Le métal est dur et froid au toucher.",
    "Un ballon qui rebondit est en …|caoutchouc|verre|bois|Le caoutchouc est élastique.",
    "Un T-shirt est souvent en …|coton|métal|verre|Le coton vient d’une plante.",
  ]),
  past: parseBank([
    "Si aujourd’hui est mercredi, demain est …|jeudi|mardi|vendredi|Après mercredi vient jeudi.",
    "Si aujourd’hui est mercredi, hier était …|mardi|jeudi|lundi|Avant mercredi vient mardi.",
    "Qui est le plus âgé ?|la grand-mère|la mère|l’enfant|Les grands-parents sont d’une génération avant les parents.",
    "Avant l’électricité, on s’éclairait avec …|des bougies|des écrans|des ampoules|Autrefois, on utilisait des bougies et des lampes à huile.",
    "Quel objet est le plus ancien ?|le téléphone à cadran|le smartphone|la tablette|Les téléphones à cadran sont d’autrefois.",
    "Quelle est la suite : passé, présent, … ?|futur|hier|avant|Le futur, c’est ce qui viendra.",
    "Quel mot parle du passé ?|hier|demain|bientôt|Hier est déjà passé.",
    "Quel mot parle du futur ?|demain|hier|autrefois|Demain n’est pas encore arrivé.",
    "À quoi sert une frise du temps ?|ranger les événements dans l’ordre|compter les étoiles|mesurer l’eau|On y place les événements du plus ancien au plus récent.",
    "Quel est le plus ancien : un château fort ou un immeuble moderne ?|le château fort|l’immeuble moderne|les deux|Les châteaux forts datent du Moyen Âge.",
    "Autrefois, pour écrire une lettre on utilisait …|une plume|un clavier|un téléphone|On trempait la plume dans l’encre.",
    "Un an, c’est combien de mois ?|12|10|7|Une année a douze mois.",
  ]),
  space_loc: parseBank([
    "Je tiens mon crayon de la main droite. L’autre main est la …|gauche|droite|haute|Droite et gauche sont les deux côtés.",
    "Un livre est posé sur la table. Il est …|sur la table|sous la table|derrière la table|« Sur » veut dire au-dessus, en contact.",
    "Le chat dort sous la chaise. Il est …|sous la chaise|sur la chaise|devant la chaise|« Sous » veut dire en dessous.",
    "Luna est entre Safran et Plume. Elle est …|au milieu|au bout|derrière|« Entre » : au milieu des deux.",
    "Quel est le contraire de « devant » ?|derrière|dessus|près|Devant ↔ derrière.",
    "Quel est le contraire de « gauche » ?|droite|haut|près|Gauche ↔ droite.",
    "Quel est le contraire de « près » ?|loin|haut|dedans|Près ↔ loin.",
    "Quel est le contraire de « dessus » ?|dessous|devant|loin|Dessus ↔ dessous.",
    "Un plan est une vue …|de dessus|de côté|de dessous|On regarde d’en haut pour dessiner un plan.",
    "Si je tourne à droite en marchant, je vais vers ma …|droite|gauche|tête|Je tourne du côté de ma main droite.",
  ]),
  sky: parseBank([
    "Quelle étoile nous éclaire le jour ?|le Soleil|la Lune|Mars|Le Soleil est l’étoile la plus proche de nous.",
    "Qu’est-ce qui brille dans le ciel la nuit et change de forme ?|la Lune|le Soleil|un nuage|La Lune montre des phases : croissant, pleine…",
    "Le Soleil se lève à l’…|est|ouest|nord|Il se lève à l’est.",
    "Le Soleil se couche à l’…|ouest|est|nord|Il se couche à l’ouest.",
    "Combien d’heures dans une journée ?|24|12|60|Un jour dure 24 heures.",
    "Comment s’appelle notre planète ?|la Terre|Mars|Vénus|Nous vivons sur la Terre.",
    "Pourquoi y a-t-il le jour et la nuit ?|la Terre tourne sur elle-même|le Soleil s’éteint|la Lune bouge|En tournant, la Terre expose un côté puis l’autre au Soleil.",
    "Quand le Soleil se lève, c’est le …|matin|soir|nuit|Le matin commence avec le lever du soleil.",
    "Quand brillent les étoiles ?|la nuit|à midi|le matin|On les voit quand il fait nuit.",
    "Combien de planètes tournent autour du Soleil ?|8|3|20|Huit planètes, dont la Terre.",
    "La Lune tourne autour de …|la Terre|la Lune|Mars|La Lune est le satellite naturel de la Terre.",
  ]),
  environment: parseBank([
    "Dans quelle poubelle jette-t-on une bouteille en plastique ?|la poubelle de tri (jaune)|le compost|la nature|Le plastique se recycle.",
    "Où met-on un pot en verre vide ?|dans le conteneur à verre|dans le compost|dans l’eau|Le verre se recycle presque à l’infini.",
    "Où jette-t-on les épluchures de légumes ?|au compost|au tri jaune|dans la rivière|Elles se transforment en terreau.",
    "Pour économiser l’eau, on ferme le robinet quand on …|se brosse les dents|a soif|se lave les mains|L’eau coule pour rien sinon.",
    "En sortant d’une pièce, on …|éteint la lumière|laisse allumé|ouvre la fenêtre|On économise l’électricité.",
    "Recycler, c’est …|donner une nouvelle vie à la matière|tout jeter|tout brûler|Les matériaux servent à fabriquer de nouveaux objets.",
    "Que fait-on de ses déchets en pique-nique ?|on les remporte|on les enterre|on les jette dans l’herbe|On laisse la nature propre.",
    "Quel moyen de transport pollue le moins ?|le vélo|la voiture|l’avion|Le vélo ne produit pas de fumée.",
    "Pourquoi faut-il protéger les arbres ?|ils nous donnent de l’air et un abri|ils sont trop grands|ils font du bruit|Ils abritent les animaux et nettoient l’air.",
    "Que peut-on faire avec un vieux jouet en bon état ?|le donner|le jeter|le casser|Le donner, c’est le réutiliser.",
  ]),
  france: parseBank([
    "Quelle est la capitale de la France ?|Paris|Lyon|Marseille|Paris est la capitale.",
    "Quelles sont les couleurs du drapeau français ?|bleu, blanc, rouge|vert, blanc, rouge|jaune, bleu, rouge|Le drapeau tricolore est bleu, blanc et rouge.",
    "Quelle mer borde le sud de la France ?|la Méditerranée|la mer du Nord|la mer Rouge|La Méditerranée est au sud.",
    "Quel océan est à l’ouest de la France ?|l’océan Atlantique|l’océan Pacifique|l’océan Indien|L’Atlantique borde la côte ouest.",
    "Comment s’appelle le fleuve qui traverse Paris ?|la Seine|la Loire|le Rhône|La Seine passe à Paris.",
    "Quelle langue parle-t-on en France ?|le français|l’anglais|l’espagnol|Le français est la langue de la République.",
    "Quel est le plus haut sommet des Alpes ?|le mont Blanc|le Vésuve|l’Everest|Le mont Blanc est le plus haut des Alpes.",
    "Notre devise est « Liberté, Égalité, … »|Fraternité|Amitié|Solidité|La devise de la France se termine par Fraternité.",
    "La Marseillaise est …|notre hymne national|une danse|un fleuve|C’est la chanson officielle de la France.",
    "Quelle fête célèbre-t-on le 14 juillet ?|la fête nationale|Noël|Pâques|Le 14 juillet est la fête nationale.",
  ]),
  emc_rules: parseBank([
    "Pourquoi y a-t-il des règles dans la classe ?|pour bien vivre ensemble|pour s’ennuyer|pour punir|Les règles protègent tout le monde.",
    "Avant de parler en classe, on …|lève la main|crie|se lève|Chacun attend son tour pour parler.",
    "Après avoir utilisé le matériel, on …|le range|le cache|le jette|Ranger aide tout le monde.",
    "Quand quelqu’un parle, je …|l’écoute|lui coupe la parole|joue|Écouter, c’est respecter.",
    "Dans la cour, on ne …|se bat pas|joue pas|court pas|On règle les disputes avec des mots.",
    "Qui doit respecter les règles ?|tout le monde|seulement les enfants|seulement la maîtresse|Les règles valent pour tous.",
    "Si je casse quelque chose sans le vouloir, je …|le dis|le cache|accuse un autre|Dire la vérité est courageux.",
    "Respecter la file d’attente, c’est …|attendre son tour|passer devant|partir|Chacun son tour.",
    "La loi, c’est …|des règles pour tout le pays|un jeu|un livre de recettes|Les lois protègent tout le monde.",
    "Si je ne suis pas d’accord, je …|le dis calmement|crie|pars en claquant la porte|On peut dire non sans être méchant.",
  ]),
  emc_respect: parseBank([
    "Quand on reçoit un cadeau, on dit …|merci|bonjour|au revoir|« Merci » montre qu’on est reconnaissant.",
    "Quand on demande quelque chose, on dit …|s’il te plaît|donne|vite|« S’il te plaît » est un mot gentil.",
    "Un camarade tombe dans la cour. Je …|l’aide|ris|m’en vais|On aide ceux qui sont tombés.",
    "On se moque d’un camarade. Je …|dis stop et préviens un adulte|ris aussi|ne fais rien|Se moquer fait mal : il faut en parler.",
    "Les différences (taille, couleur, famille) …|on les respecte|on s’en moque|on les cache|Chacun est différent et mérite le respect.",
    "Quand je me suis trompé, je dis …|pardon|rien|c’est pas moi|S’excuser répare un peu la peine.",
    "Je prête mon jeu à un ami. C’est …|partager|perdre|gagner|Partager fait plaisir à tous.",
    "Dans la bibliothèque, on parle …|doucement|fort|en criant|Le calme respecte ceux qui lisent.",
    "Quand j’arrive le matin, je dis …|bonjour|rien|merci|Dire bonjour est poli.",
    "Tout le monde est …|égal en dignité|plus important|moins important|Chacun compte autant que les autres.",
  ]),
  emc_feelings: parseBank([
    "Quand je suis en colère, je peux …|respirer lentement|taper|casser|Respirer calme le corps.",
    "Quand un ami est triste, je peux …|l’écouter et le consoler|rire de lui|partir|Écouter fait du bien.",
    "Comment s’appelle ce qu’on ressent quand on gagne un jeu ?|la joie|la peur|la colère|La joie est une émotion agréable.",
    "On peut dire ce qu’on ressent avec …|des mots|des coups|des cris|Les mots aident à se faire comprendre.",
    "Avoir peur, c’est …|normal|honteux|interdit|Tout le monde a peur parfois.",
    "Mon ami pleure. Il ressent de la …|tristesse|joie|fierté|Les larmes montrent souvent la tristesse.",
    "Quand je réussis un défi, je suis …|fier|jaloux|triste|La fierté, c’est être content de soi.",
    "Qui peut m’aider si je suis triste ?|un adulte de confiance|personne|un inconnu|Parler à quelqu’un de confiance soulage.",
    "Quelle émotion ressent-on devant un orage fort ?|la peur|l’ennui|la fierté|Les gros bruits peuvent faire peur.",
  ]),
  emc_safety: parseBank([
    "On traverse la route …|au passage piéton quand le piéton est vert|en courant|sans regarder|On s’arrête, on regarde, on traverse.",
    "En voiture, on s’attache avec …|la ceinture|un foulard|rien|La ceinture protège en cas de choc.",
    "Un inconnu m’offre des bonbons. Je …|refuse et préviens un adulte|accepte|le suis|On ne suit jamais un inconnu.",
    "Sur internet, on ne donne jamais …|son adresse|son dessin préféré|son jeu préféré|Les informations privées restent secrètes.",
    "Si je suis perdu, je demande de l’aide à …|un adulte de confiance|n’importe qui|personne|Un policier, un commerçant ou une maman avec enfants.",
    "À vélo, on porte …|un casque|un chapeau|des lunettes de soleil|Le casque protège la tête.",
    "Quel numéro appelle-t-on pour les pompiers ?|18|15|17|Le 18 : les pompiers.",
    "Quel numéro appelle-t-on pour le SAMU ?|15|18|17|Le 15 : les urgences médicales.",
    "Les produits ménagers sont …|dangereux : on n’y touche pas|des jouets|des bonbons|Ils peuvent empoisonner.",
    "Combien de temps passe-t-on devant un écran ?|peu de temps, avec un adulte|toute la journée|toute la nuit|Les écrans fatiguent : on limite.",
  ]),
  emc_rights: parseBank([
    "Tous les enfants ont le droit d’aller à …|l’école|la mine|l’usine|Aller à l’école est un droit.",
    "Les filles et les garçons sont …|égaux|différents en droits|séparés|Ils ont les mêmes droits.",
    "Tous les enfants ont le droit d’être …|soignés|battus|laissés seuls|Se soigner est un droit.",
    "Tous les enfants ont le droit de …|jouer|travailler dur|se taire toujours|Jouer est un droit de l’enfant.",
    "Tous les enfants ont le droit de donner …|leur avis|des ordres|des coups|Chacun a le droit de s’exprimer.",
    "Un enfant peut-il être obligé de travailler comme un adulte ?|non|oui|parfois|Les enfants ont le droit d’être protégés.",
    "« Fraternité » veut dire …|s’entraider|se disputer|se moquer|C’est se comporter comme des frères et sœurs.",
    "La solidarité, c’est …|aider ceux qui en ont besoin|garder pour soi|compter ses pièces|On partage et on aide.",
    "Un droit, c’est …|ce à quoi chacun peut prétendre|une punition|un jouet|Les droits protègent chaque personne.",
  ]),
};

const pairs = {
  english_days: [["Monday", "lundi"], ["Tuesday", "mardi"], ["Wednesday", "mercredi"], ["Thursday", "jeudi"], ["Friday", "vendredi"], ["Saturday", "samedi"], ["Sunday", "dimanche"]],
  english_greetings: [["hello", "bonjour"], ["goodbye", "au revoir"], ["thank you", "merci"], ["please", "s’il te plaît"], ["yes", "oui"], ["no", "non"], ["sorry", "pardon"], ["good night", "bonne nuit"], ["good morning", "bonjour (le matin)"]],
  english_family: [["mother", "mère"], ["father", "père"], ["sister", "sœur"], ["brother", "frère"], ["grandmother", "grand-mère"], ["grandfather", "grand-père"], ["baby", "bébé"], ["friend", "ami"]],
  english_body: [["head", "tête"], ["hand", "main"], ["foot", "pied"], ["eye", "œil"], ["nose", "nez"], ["mouth", "bouche"], ["ear", "oreille"], ["arm", "bras"], ["leg", "jambe"], ["hair", "cheveux"]],
  english_food: [["apple", "pomme"], ["milk", "lait"], ["bread", "pain"], ["water", "eau"], ["cheese", "fromage"], ["egg", "œuf"], ["banana", "banane"], ["cake", "gâteau"], ["chocolate", "chocolat"], ["rice", "riz"]],
};
export const englishIds = Object.keys(pairs);

export function worldExercise(q, id, seed, turn, r) {
  if (banks[id]) {
    fromBank(q, banks[id], seed, turn, r, { writable: false });
    return true;
  }
  const list = pairs[id];
  if (!list) return false;
  const w = list[seed % list.length],
    others = list.filter((x) => x !== w);
  if (turn % 3 === 0) {
    q.type = "choice";
    q.dimension = "recognition";
    q.prompt = "Écoute le mot anglais, puis choisis ce qu’il signifie.";
    q.audio = w[0];
    q.lang = "en-GB";
    q.answer = w[1];
    q.options = [w[1], others[(seed * 3) % others.length][1], others[(seed * 5 + 1) % others.length][1]];
    q.hint = `« ${w[0]} » signifie « ${w[1]} ». Réécoute-le, puis essaie avec un autre mot.`;
  } else {
    q.type = "input";
    q.dimension = "production";
    q.prompt = `Comment dit-on « ${w[1]} » en anglais ?`;
    q.answer = w[0];
    q.options = [w[0], others[(seed * 3) % others.length][0], others[(seed * 5 + 1) % others.length][0]];
    q.tolerant = true;
    q.lang = "en-GB";
    q.hint = `En anglais, « ${w[1]} » se dit « ${w[0]} ». Écoute-le et répète-le à voix haute.`;
  }
  return true;
}
export const worldIds = [...Object.keys(banks), ...englishIds];
