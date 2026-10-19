# Suivi parent et adaptation (v0.13)

Tout est calculé sur l'appareil à partir de la sauvegarde locale : rien n'est envoyé nulle part. Ce sont des **observations prudentes, pas un diagnostic**.

## Ce qui est conservé par réponse
Énoncé, réponse donnée, réponse attendue, durée, nombre d'indices, mode « exemple facilité », identifiant de mission et position dans la mission (champs facultatifs de `history`, nettoyés à la lecture ; les anciennes sauvegardes restent valides). Les preuves par notion (`skills[].evidence`) ne contiennent pas ces détails, pour garder la sauvegarde légère.

## Adaptation côté enfant
- **Exemple facilité** : après 2 échecs (ou « Je ne sais pas ») de suite sur une notion, l'exercice suivant utilise des nombres plus petits et le matériel visible ; pour les autres notions un petit coup de pouce est affiché d'emblée. Il est compté « avec aide ». Une réussite remet la difficulté normale.
- **Revoir une base** : après 3 échecs de suite, le premier prérequis déjà abordé et non solide est inséré juste après dans la mission, avec un mot de Luna.
- **Indice en deux temps** : d'abord un coup de pouce, puis l'aide complète (« Encore un indice »).

## Espace parent (`frontend/js/followup.js`)
- À faire ensemble cette semaine : 2 ou 3 notions avec une activité de 5 minutes sans écran.
- Évolution par notion sur 4 semaines (barres, statuts En progrès / Solide / Stable / À reprendre).
- Erreurs qui reviennent, décrites d'après la réponse (à un près, inversion dizaines/unités, additionne au lieu de soustraire…).
- Temps par jour, durée moyenne, repères de concentration (baisse après le 6ᵉ défi, confiance, défis longs).
- Détail des 8 dernières missions, défi par défi.
- Impression / PDF, et note si aucun défi depuis 4 jours.

Tests : `tests/followup.test.js`, `tests/followup-browser.mjs`.
