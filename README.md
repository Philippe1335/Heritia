# Héritia

**Régler une succession au Québec, une étape à la fois.**

Héritia guide les liquidateurs et les héritiers à travers la liquidation d'une
succession québécoise. Un court questionnaire (testament, immeuble, entreprise,
situation conjugale, héritiers mineurs, REER, solvabilité, rôle, date du décès)
construit un parcours personnalisé d'étapes administratives, regroupées en
quatre phases : premiers jours, premières semaines, liquidation, clôture.

Chaque étape précise quoi faire, les délais à surveiller, les pièges à éviter
(certificats fiscaux, conjoint de fait, inventaire, patrimoine familial) et
renvoie vers les ressources officielles. Quand la date du décès est fournie,
les échéances réelles sont calculées (délai de 6 mois pour renoncer, date
limite des déclarations de revenus, prestation de décès du RRQ). Une liste de
documents à rassembler est cochable, la progression est conservée localement
dans le navigateur et la liste peut être imprimée au complet.

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

## Assistant IA (optionnel)

Le bouton « Poser une question à l'assistant » n'apparaît que si un relais
serveur est configuré — la clé API ne vit jamais dans le navigateur :

1. Déployez `server/assistant.example.js` comme fonction serverless (Vercel,
   Netlify, Cloudflare Workers) avec la variable d'environnement
   `ANTHROPIC_API_KEY`.
2. Construisez le site en pointant vers cette fonction :
   `VITE_ASSISTANT_URL=/api/assistant npm run build`.

## Structure

- `src/data/parcours.js` — questions du questionnaire, calcul des échéances et
  construction du parcours personnalisé (le contenu juridique vit ici)
- `src/components/` — écrans Accueil, Questionnaire, Parcours et Assistant
- `server/assistant.example.js` — relais serverless pour l'assistant IA
- `scripts/apercu.js` — génère `heritia-apercu.html`, version autonome du site
- `tests/smoke.test.jsx` — vérifie la personnalisation, les échéances et le
  rendu des écrans
