// Test de fumée : logique de personnalisation + rendu SSR de chaque écran.
// Exécution : npm test
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import App from "../src/App.jsx";
import Parcours from "../src/components/Parcours.jsx";
import Questionnaire from "../src/components/Questionnaire.jsx";
import { buildParcours, calculerEcheances, QUESTIONS } from "../src/data/parcours.js";
import DossierNotaire from "../src/components/DossierNotaire.jsx";
import { construireSections, dossierEnTexte, dossierEnHtml } from "../src/data/dossier.js";

const base = {
  testament: "notarie",
  immeuble: false,
  entreprise: false,
  conjugal: "aucun",
  mineurs: false,
  reer: false,
  solvabilite: "solvable",
  role: "liquidateur",
  dateDeces: null,
};

// 1. La personnalisation produit les bonnes tâches selon les réponses
const cas = [
  [
    base,
    ["copie-testament"],
    ["verification", "transmission-immeuble", "entreprise", "option", "heritiers-legaux",
     "patrimoine-familial", "conjoint-fait", "mineurs", "reer", "solvabilite"],
  ],
  [
    { ...base, testament: "olographe", immeuble: true },
    ["verification", "transmission-immeuble"],
    ["copie-testament", "heritiers-legaux"],
  ],
  [
    { ...base, testament: "aucun", immeuble: true, entreprise: true, role: "heritier" },
    ["heritiers-legaux", "designation-liquidateur", "transmission-immeuble", "entreprise", "option"],
    ["copie-testament", "verification"],
  ],
  [
    { ...base, conjugal: "marie", mineurs: true, reer: true, solvabilite: "incertaine" },
    ["patrimoine-familial", "mineurs", "reer", "solvabilite"],
    ["conjoint-fait", "option"],
  ],
  [
    { ...base, testament: "aucun", conjugal: "fait" },
    ["conjoint-fait", "heritiers-legaux"],
    ["patrimoine-familial"],
  ],
];

for (const [r, doit, neDoitPas] of cas) {
  const ids = buildParcours(r).flatMap((p) => p.taches.map((t) => t.id));
  if (new Set(ids).size !== ids.length) throw new Error("ids dupliqués : " + JSON.stringify(r));
  for (const id of doit)
    if (!ids.includes(id)) throw new Error(`manque ${id} pour ${JSON.stringify(r)}`);
  for (const id of neDoitPas)
    if (ids.includes(id)) throw new Error(`${id} ne devrait pas être là pour ${JSON.stringify(r)}`);
  console.log(`OK personnalisation → ${ids.length} tâches`);
}

// 2. Le calcul des échéances à partir de la date du décès
const e1 = calculerEcheances("2026-01-15");
if (!e1.option6mois.includes("juillet") || !e1.option6mois.includes("2026"))
  throw new Error("option 6 mois incorrecte : " + e1.option6mois);
if (!e1.impots.includes("30 avril") || !e1.impots.includes("2027"))
  throw new Error("échéance d'impôts incorrecte : " + e1.impots);
const e2 = calculerEcheances("2025-12-01");
if (!e2.impots.includes("juin") || !e2.impots.includes("2026"))
  throw new Error("décès de fin d'année : échéance 6 mois attendue, reçu " + e2.impots);
if (calculerEcheances(null) !== null || calculerEcheances("n'importe quoi") !== null)
  throw new Error("date invalide : null attendu");
console.log("OK calcul des échéances");

// 3. Les échéances calculées apparaissent dans les tâches
const avecDate = buildParcours({ ...base, role: "heritier", dateDeces: "2026-01-15" });
const tachesAvecDate = avecDate.flatMap((p) => p.taches);
const option = tachesAvecDate.find((t) => t.id === "option");
if (!option.delai.includes("juillet 2026"))
  throw new Error("le délai de l'option n'utilise pas la date : " + option.delai);
console.log("OK échéances injectées dans le parcours");

// 4. La question de date est retirée pour qui s'informe à l'avance
const sansDate = QUESTIONS.filter((q) => !q.si || q.si({ role: "preparation" }));
const avecDateQ = QUESTIONS.filter((q) => !q.si || q.si({ role: "liquidateur" }));
if (sansDate.length !== avecDateQ.length - 1)
  throw new Error("la question de date devrait être conditionnelle au rôle");
console.log("OK question de date conditionnelle");

// 5. Chaque écran se rend sans erreur
const accueil = renderToString(h(App));
if (!accueil.includes("HÉRITIA") || !accueil.includes("Commencer mon parcours"))
  throw new Error("accueil incomplet");
console.log("OK rendu accueil");

const quest = renderToString(h(Questionnaire, { reponsesInitiales: null, onDone: () => {} }));
if (!quest.includes(QUESTIONS[0].q)) throw new Error("questionnaire incomplet");
console.log("OK rendu questionnaire");

const reponses = {
  ...base,
  testament: "aucun",
  immeuble: true,
  entreprise: true,
  conjugal: "marie",
  mineurs: true,
  reer: true,
  solvabilite: "incertaine",
  role: "heritier",
  dateDeces: "2026-01-15",
};
const parcours = renderToString(
  h(Parcours, {
    phases: buildParcours(reponses),
    reponses,
    faits: { deces: true, "doc-testament": true },
    onBasculerFait: () => {},
    onModifier: () => {},
    onRecommencer: () => {},
    onChat: null,
  })
);
for (const attendu of [
  "Votre parcours de liquidation",
  "Notaire requis",
  "Héritier",
  "MR-14.A",
  "patrimoine familial",
  "Curateur public",
  "roulement",
  "juillet 2026",
  "Certificats de décès",
  "Héritiers mineurs",
  "Solvabilité à vérifier",
]) {
  if (!parcours.includes(attendu)) throw new Error("parcours : manque « " + attendu + " »");
}
console.log("OK rendu parcours complet");

// 6. Les nouvelles étapes notaire sont dans tous les parcours
const idsNotaire = buildParcours(base).flatMap((p) => p.taches.map((t) => t.id));
for (const id of ["dossier-notaire", "signature-notaire"])
  if (!idsNotaire.includes(id)) throw new Error(`manque l'étape ${id}`);
console.log("OK étapes dossier et signature notaire");

// 7. Génération du dossier pour le notaire
const dossier = {
  defuntNom: "Jeanne Tremblay",
  defuntAdresse: "12 rue des Érables, Québec",
  demandeurNom: "Marc Tremblay",
  heritiers: [
    { nom: "Marc Tremblay", lien: "fils" },
    { nom: "Léa Tremblay", lien: "fille, 16 ans" },
    { nom: "", lien: "" },
  ],
  institutions: "Desjardins",
  notes: "Le chalet est-il dans le patrimoine familial?",
  notaireCourriel: "notaire@exemple.ca",
};
const sections = construireSections(dossier, reponses, { recherche: true, "doc-testament": true });
const titres = sections.map((s) => s.titre);
for (const t of ["Personne décédée", "Héritiers connus", "Patrimoine", "Points de vigilance", "Documents"])
  if (!titres.includes(t)) throw new Error("dossier : section manquante « " + t + " »");
const texte = dossierEnTexte(dossier, reponses, { recherche: true, "doc-testament": true });
for (const attendu of [
  "Jeanne Tremblay",
  "Léa Tremblay — fille, 16 ans",
  "Recherches testamentaires",
  "Faites",
  "patrimoine familial",
  "Testament et codicilles",
  "15 janvier 2026",
]) {
  if (!texte.includes(attendu)) throw new Error("dossier texte : manque « " + attendu + " »");
}
const htmlDossier = dossierEnHtml(dossier, reponses, {});
if (!htmlDossier.includes("<!doctype html>") || !htmlDossier.includes("Jeanne Tremblay"))
  throw new Error("dossier HTML incomplet");
if (dossierEnHtml({ defuntNom: "<script>x</script>" }, reponses, {}).includes("<script>x"))
  throw new Error("dossier HTML : échappement manquant");
console.log("OK génération du dossier (sections, texte, HTML, échappement)");

// 8. L'écran dossier se rend, aperçu compris
const ecranDossier = renderToString(
  h(DossierNotaire, {
    dossier,
    reponses,
    faits: {},
    onMaj: () => {},
    onRetour: () => {},
  })
);
for (const attendu of ["Votre dossier pour le notaire", "Jeanne Tremblay", "Dossier de succession"])
  if (!ecranDossier.includes(attendu)) throw new Error("écran dossier : manque « " + attendu + " »");
console.log("OK rendu écran dossier");

console.log("TOUS LES TESTS PASSENT");
