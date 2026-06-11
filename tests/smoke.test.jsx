// Test de fumée : logique de personnalisation + rendu SSR de chaque écran.
// Exécution : npm test
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import App from "../src/App.jsx";
import Parcours from "../src/components/Parcours.jsx";
import Questionnaire from "../src/components/Questionnaire.jsx";
import { buildParcours, QUESTIONS } from "../src/data/parcours.js";

// 1. La personnalisation produit les bonnes tâches selon les réponses
const cas = [
  [
    { testament: "notarie", immeuble: false, entreprise: false, role: "liquidateur" },
    ["copie-testament"],
    ["verification", "transmission-immeuble", "entreprise", "option", "heritiers-legaux"],
  ],
  [
    { testament: "olographe", immeuble: true, entreprise: false, role: "liquidateur" },
    ["verification", "transmission-immeuble"],
    ["copie-testament", "heritiers-legaux"],
  ],
  [
    { testament: "aucun", immeuble: true, entreprise: true, role: "heritier" },
    ["heritiers-legaux", "designation-liquidateur", "transmission-immeuble", "entreprise", "option"],
    ["copie-testament", "verification"],
  ],
  [
    { testament: "notarie", immeuble: true, entreprise: true, role: "preparation" },
    ["copie-testament", "transmission-immeuble", "entreprise"],
    ["option"],
  ],
];

for (const [r, doit, neDoitPas] of cas) {
  const ids = buildParcours(r).flatMap((p) => p.taches.map((t) => t.id));
  if (new Set(ids).size !== ids.length) throw new Error("ids dupliqués : " + JSON.stringify(r));
  for (const id of doit)
    if (!ids.includes(id)) throw new Error(`manque ${id} pour ${JSON.stringify(r)}`);
  for (const id of neDoitPas)
    if (ids.includes(id)) throw new Error(`${id} ne devrait pas être là pour ${JSON.stringify(r)}`);
  console.log(`OK ${JSON.stringify(r)} → ${ids.length} tâches`);
}

// 2. Chaque écran se rend sans erreur
const accueil = renderToString(h(App));
if (!accueil.includes("HÉRITIA") || !accueil.includes("Commencer mon parcours"))
  throw new Error("accueil incomplet");
console.log("OK rendu accueil");

const quest = renderToString(h(Questionnaire, { reponsesInitiales: null, onDone: () => {} }));
if (!quest.includes(QUESTIONS[0].q)) throw new Error("questionnaire incomplet");
console.log("OK rendu questionnaire");

const reponses = { testament: "aucun", immeuble: true, entreprise: true, role: "heritier" };
const parcours = renderToString(
  h(Parcours, {
    phases: buildParcours(reponses),
    reponses,
    faits: { deces: true },
    onBasculerFait: () => {},
    onModifier: () => {},
    onRecommencer: () => {},
  })
);
for (const attendu of [
  "Votre parcours de liquidation",
  "conjoint de fait",
  "Notaire requis",
  "Héritier",
  "MR-14.A",
]) {
  if (!parcours.includes(attendu)) throw new Error("parcours : manque « " + attendu + " »");
}
console.log("OK rendu parcours complet");
console.log("TOUS LES TESTS PASSENT");
