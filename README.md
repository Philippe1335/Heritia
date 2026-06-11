# Héritia

**Régler une succession au Québec, une étape à la fois.**

Héritia guide les liquidateurs et les héritiers à travers la liquidation d'une
succession québécoise. Un court questionnaire (testament, immeuble, entreprise,
rôle) construit un parcours personnalisé d'étapes administratives, regroupées en
quatre phases : premiers jours, premières semaines, liquidation, clôture.

Chaque étape précise quoi faire, les délais à surveiller, les pièges à éviter
(certificats fiscaux, conjoint de fait, inventaire) et renvoie vers les
ressources officielles. La progression est conservée localement dans le
navigateur et la liste peut être imprimée au complet.

> Héritia est un outil d'information et d'organisation. Il ne remplace pas les
> conseils d'un notaire ou d'un avocat.

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm test         # tests de fumée (logique + rendu SSR)
npm run build    # build de production dans dist/
```

Stack : React 19 + Vite. Aucune dépendance serveur — le site est entièrement
statique et se déploie sur n'importe quel hébergement de fichiers.

## Structure

- `src/data/parcours.js` — questions du questionnaire et construction du
  parcours personnalisé (le contenu juridique vit ici)
- `src/components/` — écrans Accueil, Questionnaire et Parcours
- `tests/smoke.test.jsx` — vérifie la personnalisation et le rendu des écrans
