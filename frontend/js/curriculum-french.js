import { pick, between, shuffled, parseBank, fromBank } from "./curriculum-core.js";

const banks = {
  sentence_types: parseBank([
    "« Quelle heure est-il » : quel signe met-on à la fin ?|le point d’interrogation|le point|le point d’exclamation|Une question se termine par un point d’interrogation.",
    "« Le chat dort » : quel signe met-on à la fin ?|le point|le point d’interrogation|le point d’exclamation|Une phrase qui raconte quelque chose se termine par un point.",
    "« Quel beau dessin » : quel signe met-on à la fin ?|le point d’exclamation|le point|le point d’interrogation|Pour montrer qu’on est surpris ou content, on met un point d’exclamation.",
    "Quelle phrase pose une question ?|As-tu faim ?|J’ai faim.|Quelle belle journée !|Une question demande quelque chose et finit par « ? ».",
    "Quelle phrase est une exclamation ?|Quel beau château !|Où est le château ?|Le château est grand.|Une exclamation montre une émotion et finit par « ! ».",
    "Quelle phrase raconte quelque chose ?|Luna cueille des fleurs.|Luna cueille-t-elle des fleurs ?|Que de fleurs !|Elle dit ce que fait Luna et finit par un point.",
    "Une phrase commence toujours par …|une majuscule|une virgule|un point|Au début d’une phrase, on écrit une majuscule.",
    "Que faut-il écrire pour que « le dragon dort » soit bien écrit ?|une majuscule au début et un point à la fin|rien du tout|des majuscules partout|Il y a une majuscule au début et un point à la fin.",
    "Que faut-il écrire pour que « où vas-tu » soit bien écrit ?|une majuscule et un point d’interrogation|une majuscule et un point|rien du tout|Une question : majuscule au début et « ? » à la fin.",
    "« Tu viens jouer » : quel signe met-on à la fin pour poser une question ?|le point d’interrogation|le point|le point d’exclamation|Quand on demande quelque chose, on met un point d’interrogation.",
    "Combien de phrases y a-t-il ? « Luna rit. Le dragon dort. »|2|1|3|Chaque phrase finit par un point : il y en a deux.",
    "À la fin d’une phrase qui raconte quelque chose, on met …|un point|une virgule|un tiret|Une phrase qui raconte se termine par un point.",
  ]),
  pronoun: parseBank([
    "Dans « Luna chante », par quel mot peut-on remplacer « Luna » ?|elle|il|ils|Luna est une fille : on dit « elle ».",
    "Dans « Le garçon court », par quel mot remplace-t-on « Le garçon » ?|il|elle|elles|Un garçon : on dit « il ».",
    "« Les filles dansent » : on peut dire …|elles dansent|ils dansent|elle danse|Plusieurs filles : « elles ».",
    "« Les chats dorment » : on peut dire …|ils dorment|il dort|elles dorment|Plusieurs animaux mâles ou un groupe mélangé : « ils ».",
    "Quel pronom utilise-t-on pour parler de soi ?|je|tu|il|Quand je parle de moi, je dis « je ».",
    "Quel pronom utilise-t-on pour parler à une personne ?|tu|je|nous|On dit « tu » à quelqu’un à qui on parle.",
    "Mon frère et moi, on peut dire …|nous|vous|ils|Moi et un autre : « nous ».",
    "Toi et ton ami, on peut dire …|vous|nous|ils|Plusieurs personnes à qui on parle : « vous ».",
    "« Papa lit » : on peut dire …|il lit|elle lit|ils lisent|Papa : « il ».",
    "« Maman cuisine » : on peut dire …|elle cuisine|il cuisine|ils cuisinent|Maman : « elle ».",
    "« Luna et Safran jouent » : on peut dire …|ils jouent|elles jouent|il joue|Un groupe avec un garçon ou un animal masculin : « ils ».",
    "Dans « Elle chante », « elle » est un …|pronom|nom|verbe|Un pronom remplace un nom.",
  ]),
  gender: parseBank([
    "Quel est le féminin de « roi » ?|reine|roie|rois|Le roi et la reine.",
    "Quel est le féminin de « père » ?|mère|pèrette|pairesse|Le père et la mère.",
    "Quel est le féminin de « frère » ?|sœur|frèrette|mère|Le frère et la sœur.",
    "Quel est le féminin de « garçon » ?|fille|garçonne|garce|Le garçon et la fille.",
    "Quel est le féminin de « coq » ?|poule|coque|coqette|Le coq et la poule.",
    "Quel est le féminin de « chien » ?|chienne|chiene|chienette|La chienne est la femelle du chien.",
    "Quel est le féminin de « lion » ?|lionne|lione|lionette|Le lion et la lionne.",
    "Quel est le féminin de « ami » ?|amie|amiette|amisse|Un ami, une amie : on ajoute un « e ».",
    "Quel est le féminin de « voisin » ?|voisine|voisinne|voisinette|Un voisin, une voisine.",
    "Quel est le féminin de « cheval » ?|jument|chevale|chevaline|Le cheval et la jument.",
    "Quel est le féminin de « oncle » ?|tante|oncle|tonte|Un oncle, une tante.",
    "Quel est le féminin de « taureau » ?|vache|taurelle|taurine|Le taureau et la vache.",
  ]),
  plural: parseBank([
    "Écris au pluriel : « chat ».|chats|chat|chatx|Beaucoup de noms prennent un « s » au pluriel.",
    "Écris au pluriel : « cheval ».|chevaux|chevals|chevalx|Les noms en -al font -aux : un cheval, des chevaux.",
    "Écris au pluriel : « bateau ».|bateaux|bateaus|bateau|Les noms en -eau prennent un « x ».",
    "Écris au pluriel : « jeu ».|jeux|jeus|jeu|Les noms en -eu prennent un « x ».",
    "Écris au pluriel : « animal ».|animaux|animals|animalx|Les noms en -al font -aux.",
    "Écris au pluriel : « journal ».|journaux|journals|journalx|Les noms en -al font -aux.",
    "Écris au pluriel : « gâteau ».|gâteaux|gâteaus|gâteau|Les noms en -eau prennent un « x ».",
    "Écris au pluriel : « fleur ».|fleurs|fleur|fleurx|Pas d’exception ici : on ajoute un « s ».",
    "Écris au pluriel : « souris ».|souris|sourit|sourix|Les noms qui finissent par « s » ne changent pas.",
    "Écris au pluriel : « nez ».|nez|nezs|nezx|Les noms qui finissent par « z » ne changent pas.",
    "Écris au pluriel : « château ».|châteaux|châteaus|château|Les noms en -eau prennent un « x ».",
    "Écris au pluriel : « livre ».|livres|livre|livrex|On ajoute un « s ».",
  ]),
  homophones: parseBank([
    "Choisis le bon mot : « Luna … un chapeau rouge. »|a|à|a|« a » peut se remplacer par « avait » : Luna avait un chapeau. C’est le verbe avoir.",
    "Choisis le bon mot : « Je vais … l’école. »|à|a|à|On ne peut pas dire « je vais avait l’école » : on écrit « à ».",
    "Choisis le bon mot : « Le chat … le chien jouent. »|et|est|et|« et » veut dire « et aussi » : le chat et le chien.",
    "Choisis le bon mot : « Le dragon … très grand. »|est|et|est|« est » peut se remplacer par « était » : le dragon était grand.",
    "Choisis le bon mot : « Mes amis … gentils. »|sont|son|sont|« sont » peut se remplacer par « étaient ».",
    "Choisis le bon mot : « Luna prend … sac. »|son|sont|son|« son » peut se remplacer par « mon » : Luna prend mon sac.",
    "Choisis le bon mot : « Ils … un chien. »|ont|on|ont|« ont » peut se remplacer par « avaient ».",
    "Choisis le bon mot : « … joue dans le jardin. »|On|Ont|On|« on » peut se remplacer par « il » : il joue dans le jardin.",
    "Choisis le bon mot : « Paul … content. »|est|et|est|On peut dire « Paul était content ».",
    "Choisis le bon mot : « Du pain … du fromage. »|et|est|et|« et » relie deux choses : du pain et du fromage.",
    "Choisis le bon mot : « Je donne une pomme … Luna. »|à|a|à|On ne peut pas dire « avait Luna » : on écrit « à ».",
    "Choisis le bon mot : « Ma sœur … six ans. »|a|à|a|Ma sœur avait six ans : c’est le verbe avoir.",
    "Choisis le bon mot : « Les enfants … faim. »|ont|on|ont|Les enfants avaient faim : « ont ».",
    "Choisis le bon mot : « Marie range … cartable. »|son|sont|son|Marie range mon cartable : « son ».",
    "Choisis le bon mot : « … va au parc ? »|On|Ont|On|Il va au parc ? On peut remplacer par « il » : « On ».",
  ]),
  synonyms: parseBank([
    "Quel mot a presque le même sens que « joli » ?|beau|laid|triste|Joli et beau veulent dire presque la même chose.",
    "Quel mot a presque le même sens que « content » ?|heureux|fâché|fatigué|Content et heureux sont proches.",
    "Quel mot a presque le même sens que « grand » ?|immense|minuscule|rond|Immense veut dire très grand.",
    "Quel mot a presque le même sens que « petit » ?|minuscule|énorme|haut|Minuscule veut dire très petit.",
    "Quel mot a presque le même sens que « triste » ?|malheureux|joyeux|calme|Malheureux et triste se ressemblent.",
    "Quel mot a presque le même sens que « rire » ?|rigoler|pleurer|crier|Rire et rigoler : même idée.",
    "Quel mot a presque le même sens que « parler » ?|bavarder|dormir|courir|Parler et bavarder se ressemblent.",
    "Quel mot a presque le même sens que « sauter » ?|bondir|tomber|ramper|Bondir, c’est sauter haut.",
    "Quel mot a presque le même sens que « regarder » ?|observer|oublier|écrire|Observer, c’est regarder avec attention.",
    "Quel mot a presque le même sens que « fort » ?|puissant|fragile|lent|Puissant et fort sont proches.",
    "Quel mot a presque le même sens que « froid » ?|glacé|brûlant|tiède|Glacé veut dire très froid.",
    "Quel mot a presque le même sens que « gentil » ?|aimable|méchant|bruyant|Gentil et aimable se ressemblent.",
  ]),
  antonyms: parseBank([
    "Quel est le contraire de « grand » ?|petit|haut|long|Grand ↔ petit.",
    "Quel est le contraire de « chaud » ?|froid|tiède|brûlant|Chaud ↔ froid.",
    "Quel est le contraire de « jour » ?|nuit|soir|matin|Jour ↔ nuit.",
    "Quel est le contraire de « ouvrir » ?|fermer|casser|pousser|Ouvrir ↔ fermer.",
    "Quel est le contraire de « monter » ?|descendre|sauter|marcher|Monter ↔ descendre.",
    "Quel est le contraire de « rapide » ?|lent|vite|fort|Rapide ↔ lent.",
    "Quel est le contraire de « content » ?|triste|heureux|joyeux|Content ↔ triste.",
    "Quel est le contraire de « plein » ?|vide|rempli|lourd|Plein ↔ vide.",
    "Quel est le contraire de « haut » ?|bas|grand|long|Haut ↔ bas.",
    "Quel est le contraire de « gentil » ?|méchant|aimable|doux|Gentil ↔ méchant.",
    "Quel est le contraire de « avant » ?|après|pendant|hier|Avant ↔ après.",
    "Quel est le contraire de « entrer » ?|sortir|rentrer|arriver|Entrer ↔ sortir.",
    "Quel est le contraire de « dur » ?|mou|lourd|froid|Dur ↔ mou.",
    "Quel est le contraire de « sec » ?|mouillé|chaud|léger|Sec ↔ mouillé.",
  ]),
  word_family: parseBank([
    "Quel mot est de la même famille que « dent » ?|dentiste|danse|dedans|Dentiste vient de dent.",
    "Quel mot est de la même famille que « fleur » ?|fleuriste|flèche|fleuve|Fleuriste vend des fleurs.",
    "Quel mot est de la même famille que « lait » ?|laitier|laid|lacet|Le laitier apporte le lait.",
    "Quel mot est de la même famille que « jardin » ?|jardinier|jardon|journal|Le jardinier s’occupe du jardin.",
    "Quel mot est de la même famille que « terre » ?|terrain|tirer|terrible|Un terrain est de la terre.",
    "Quel mot est de la même famille que « chant » ?|chanteur|champ|chance|Le chanteur chante.",
    "Quel mot est de la même famille que « danse » ?|danseur|dense|dans|Le danseur danse.",
    "Quel mot est de la même famille que « neige » ?|neiger|nager|nuage|Il va neiger : le verbe de la neige.",
    "Quel mot est de la même famille que « montagne » ?|montagnard|monter|monnaie|Un montagnard vit à la montagne.",
    "Quel mot est de la même famille que « peindre » ?|peinture|pendre|peigne|La peinture vient de peindre.",
    "Quel mot est de la même famille que « livre » ?|librairie|libre|lèvre|On achète des livres à la librairie.",
    "Quel mot est de la même famille que « sable » ?|sablier|table|stable|Un sablier contient du sable.",
  ]),
  syllables: parseBank([
    "Combien de syllabes dans « chat » ?|1|2|3|chat : une seule syllabe.",
    "Combien de syllabes dans « lapin » ?|2|1|3|la-pin : 2 syllabes.",
    "Combien de syllabes dans « cheval » ?|2|1|3|che-val : 2 syllabes.",
    "Combien de syllabes dans « papillon » ?|3|2|4|pa-pil-lon : 3 syllabes.",
    "Combien de syllabes dans « éléphant » ?|3|2|4|é-lé-phant : 3 syllabes.",
    "Combien de syllabes dans « chocolat » ?|3|2|4|cho-co-lat : 3 syllabes.",
    "Combien de syllabes dans « ananas » ?|3|2|4|a-na-nas : 3 syllabes.",
    "Combien de syllabes dans « ordinateur » ?|4|3|5|or-di-na-teur : 4 syllabes.",
    "Combien de syllabes dans « soleil » ?|2|1|3|so-leil : 2 syllabes.",
    "Combien de syllabes dans « kangourou » ?|3|2|4|kan-gou-rou : 3 syllabes.",
    "Combien de syllabes dans « pain » ?|1|2|3|pain : une syllabe.",
    "Combien de syllabes dans « parapluie » ?|3|2|4|pa-ra-pluie : 3 syllabes.",
  ]),
  sounds: parseBank([
    "Quel mot commence par le son « ch » comme dans « chat » ?|chapeau|sapin|cerise|Chapeau commence par « ch ».",
    "Quel mot contient le son « ou » ?|loup|lune|lit|Loup : on entend « ou ».",
    "Quel mot contient le son « on » ?|ballon|bateau|balai|Ballon : on entend « on ».",
    "Quel mot contient le son « an » ?|maman|moto|mur|Maman : on entend « an ».",
    "Quel mot contient le son « oi » ?|poisson|pomme|poule|Poisson : on entend « oi ».",
    "Quel mot contient le son « eau » ?|gâteau|gare|gomme|Gâteau : on entend « o » écrit « eau ».",
    "Pour entendre « s » dans « poisson », on écrit …|ss|s|c|Entre deux voyelles, « ss » fait le son [s] (un seul « s » ferait [z]).",
    "Pour entendre [s] devant « o » dans « garçon », on écrit …|ç|c|s|Le « ç » garde le son [s] devant a, o, u.",
    "Pour entendre [g] devant « i » dans « guitare », on écrit …|gu|g|j|« gu » garde le son [g] devant e, i, y.",
    "Devant « p » ou « b », on écrit …|m|n|nn|On écrit « lampe », « jambe » : « m » devant p et b.",
    "Quel mot se termine par le son « eur » ?|fleur|fleuve|feu|Fleur finit par « eur ».",
    "Quel mot contient le son « ai » comme dans « lait » ?|maison|mouton|lune|Maison : on entend « è » écrit « ai ».",
  ]),
  noun_types: parseBank([
    "Quel mot est un nom propre ?|Léa|table|chat|Un nom propre désigne une personne, une ville… et commence par une majuscule.",
    "Quel mot est un nom commun ?|maison|Paris|Marie|Maison désigne n’importe quelle maison : c’est un nom commun.",
    "Un nom propre commence par …|une majuscule|une virgule|un point|Les noms propres ont une majuscule.",
    "Le nom d’une ville s’écrit …|avec une majuscule au début|sans majuscule|tout en majuscules|Un nom de ville commence par une majuscule.",
    "Quel mot est un nom propre ?|France|pays|rue|France est le nom d’un pays précis.",
    "Quel mot est un nom commun ?|chien|Rex|Tom|Rex et Tom sont des prénoms. Chien est un nom commun.",
    "Quel mot est un nom propre ?|Luna|fée|fleur|Luna est un prénom.",
    "« Le dragon s’appelle Braise » : quel est le nom propre ?|Braise|dragon|appelle|Braise est le prénom du dragon.",
    "Quel mot est un nom commun ?|ville|Lyon|Paris|Ville est commun, Lyon est un nom propre.",
    "Quel mot est un nom propre ?|Pierre|garçon|enfant|Pierre est un prénom précis.",
  ]),
};

const ER = ["chanter", "jouer", "danser", "regarder", "parler", "dessiner", "sauter", "marcher", "manger", "porter"];
const PRON = ["je", "tu", "il", "nous", "vous", "ils"];
const PRON_LABEL = ["Je", "Tu", "Il", "Nous", "Vous", "Ils"];
const FUT = ["ai", "as", "a", "ons", "ez", "ont"];
const IRR = {
  aller: ["vais", "vas", "va", "allons", "allez", "vont"],
  faire: ["fais", "fais", "fait", "faisons", "faites", "font"],
  dire: ["dis", "dis", "dit", "disons", "dites", "disent"],
  venir: ["viens", "viens", "vient", "venons", "venez", "viennent"],
};
const AUX = ["ai", "as", "a", "avons", "avez", "ont"];
const participle = (inf) => inf.slice(0, -2) + "é";

export function frenchExercise(q, id, seed, turn, r) {
  if (banks[id]) {
    const item = fromBank(q, banks[id], seed, turn, r, { writable: !["homophones", "sentence_types", "pronoun"].includes(id) });
    if (id === "plural" || id === "gender" || id === "word_family") q.tolerant = q.type === "input";
    if (id === "syllables") q.numeric = true;
    return !!item;
  }
  const i = seed % 6,
    p = PRON[i];
  switch (id) {
    case "futur": {
      const verbs = [...ER, "être", "avoir"],
        v = verbs[Math.floor(seed / 6) % verbs.length];
      let forms;
      if (v === "être") forms = ["serai", "seras", "sera", "serons", "serez", "seront"];
      else if (v === "avoir") forms = ["aurai", "auras", "aura", "aurons", "aurez", "auront"];
      else forms = FUT.map((e) => v + e);
      const who = v === "avoir" && i === 0 ? "J’" : PRON_LABEL[i] + " ";
      q.prompt = `Demain, ${who}… (${v}). Écris le verbe au futur.`;
      q.answer = forms[i];
      q.options = [forms[i], forms[(i + 1) % 6], forms[(i + 3) % 6]];
      q.tolerant = true;
      q.hint = v === "être" || v === "avoir" ? `Au futur, ${v} change beaucoup : ${forms.join(", ")}.` : `Au futur, on garde tout l’infinitif (${v}) et on ajoute : -ai, -as, -a, -ons, -ez, -ont. Ici : ${v} + ${FUT[i]}.`;
      return true;
    }
    case "passe_compose": {
      const v = ER[Math.floor(seed / 6) % ER.length],
        part = participle(v),
        ans = `${AUX[i]} ${part}`;
      q.prompt = `Hier, ${i === 0 ? "j’" : PRON_LABEL[i] + " "}… (${v}). Écris le verbe au passé composé.`;
      q.answer = ans;
      q.accepted = [`${p === "je" ? "j’" : p + " "}${ans}`, `${p === "je" ? "j'" : p + " "}${ans}`];
      q.options = [ans, `${AUX[(i + 1) % 6]} ${part}`, `${AUX[i]} ${v}`];
      q.hint = `Au passé composé : « avoir » au présent + le participe passé. Ici : ${AUX[i]} + ${part}.`;
      return true;
    }
    case "irregular": {
      const inf = Object.keys(IRR)[Math.floor(seed / 6) % 4],
        forms = IRR[inf];
      q.prompt = `Complète : « ${PRON_LABEL[i]} … » (verbe ${inf}, au présent).`;
      q.answer = forms[i];
      q.options = [...new Set([forms[i], forms[(i + 1) % 6], forms[(i + 2) % 6], forms[(i + 3) % 6]])].slice(0, 4);
      q.tolerant = true;
      q.hint = `${inf} au présent : je ${forms[0]}, tu ${forms[1]}, il ${forms[2]}, nous ${forms[3]}, vous ${forms[4]}, ils ${forms[5]}.`;
      return true;
    }
    case "alphabet": {
      const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        v = seed % 4;
      if (v === 0 || v === 1) {
        const k = between(r, 1, 24);
        q.prompt = v === 0 ? `Quelle lettre vient juste après ${L[k]} dans l’alphabet ?` : `Quelle lettre vient juste avant ${L[k]} dans l’alphabet ?`;
        q.answer = v === 0 ? L[k + 1] : L[k - 1];
        q.options = [q.answer, L[(k + 3) % 26], L[(k + 5) % 26]];
        q.tolerant = false;
        q.hint = `L’alphabet : ${L.slice(Math.max(0, k - 2), k + 3).split("").join(", ")}…`;
      } else {
        const groups = [["arbre", "chat", "lune"], ["maison", "mouche", "mouton"], ["bateau", "bonbon", "bulle"], ["fée", "fleur", "forêt"], ["pomme", "poule", "prince"], ["lapin", "livre", "loup"]],
          g = groups[Math.floor(seed / 4) % groups.length];
        q.prompt = `Quel mot vient en premier dans le dictionnaire : ${shuffled(r, g).join(", ")} ?`;
        q.answer = g[0];
        q.options = [...g];
        q.tolerant = true;
        q.hint = `On regarde la première lettre ; si elle est pareille, on compare la deuxième. Dans l’ordre : ${g.join(", ")}.`;
      }
      return true;
    }
    default:
      return false;
  }
}
export const frenchIds = [...Object.keys(banks), "futur", "passe_compose", "irregular", "alphabet"];
