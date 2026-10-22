# Évaluation et adaptation (v0.19.0)

Tout est calculé sur l'appareil à partir de la sauvegarde ; rien n'est envoyé ailleurs, hors synchronisation chiffrée facultative. Ce sont des repères prudents, pas des notes ni un diagnostic.

1. **Bilan complet** (`evaluation.js`, `evaluation-ui.js`) : une question par petit pouvoir, par séries de 8 au plus (page « Le bilan de Luna », accessible depuis les missions). Palier normal, « Je ne sais pas » accepté, pas de répétition des erreurs. Résultat enregistré dans `state.assessment` (par notion : date, série, `auto` / `helped` / `wrong`) et fusionné entre appareils par date. Carte 🌷 acquis · 🌿 à consolider · 🌱 à découvrir · ◻︎ pas encore vu ; une notion « à découvrir » passe à « acquise » après 2 réussites seule ensuite.
2. **Échelle de difficulté** : 3 paliers (pas à pas · normal · défi) sur 14 notions de calcul (`TIERED`). On monte après 3 réussites seule de suite, on redescend après 2 échecs de suite ; calculé depuis l'historique, figé pour la durée d'une question (`session.questionTier`). Les autres notions n'ont pas de palier (le mode « exemple facilité » reste actif).
3. **Erreurs typées** (`slips.js`) : retenue oubliée, échange oublié, addition à la place de la multiplication, -s / -e / auxiliaire oubliés, etc. Utilisé par le suivi parent (« Erreurs qui reviennent ») et par l'explication à l'enfant.
4. **Mission « points à renforcer »** : 6 défis répartis sur les 3 notions les plus fragiles (tendance, bilan, rapidité, erreurs récurrentes). La répétition espacée (1, 3, 7, 14, 30 jours) existait déjà et alimente « Luna te repose une question ».
5. **Rapidité invisible** : le temps de réponse (`ms`) est mesuré sans chrono affiché. Médiane des réussites seule sur 12 réponses au plus, avec au moins 4 mesures ; seuils plus stricts pour les automatismes (tables, compléments, doubles…).
6. **Mini-bilan mélangé** : à la fin d'un chapitre, 5 questions sur des notions déjà vues (bouton visible dès 3 notions).
7. **Rapport de la semaine** (espace parent) : défis et réussites sans aide comparés à la semaine précédente, trois forces, progrès, points à renforcer, idées de 5 minutes à la maison. Imprimable avec le bouton existant.

Un bilan rend les notions testées « abordées » (nécessaire pour les proposer en mission) sans leur donner de preuve de maîtrise au-delà de la réponse enregistrée.
