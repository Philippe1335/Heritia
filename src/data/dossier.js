// Génération du dossier de succession destiné au notaire.
// Construit à partir des réponses au questionnaire, de la progression et du
// formulaire « Dossier notaire » — tout reste dans le navigateur du client.
import { LIBELLES_REPONSES, DOCUMENTS, calculerEcheances } from "./parcours.js";

const FORMAT_DATE = new Intl.DateTimeFormat("fr-CA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const val = (x) => {
  const t = x == null ? "" : String(x).trim();
  return t || null;
};

const formatDateIso = (iso) => {
  if (!val(iso) || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return val(iso);
  return FORMAT_DATE.format(new Date(iso + "T12:00:00"));
};

export const DOSSIER_VIDE = {
  defuntNom: "",
  defuntNaissance: "",
  defuntAdresse: "",
  demandeurNom: "",
  demandeurTelephone: "",
  demandeurCourriel: "",
  conjointNom: "",
  testamentNotaire: "",
  heritiers: [],
  immeubleAdresse: "",
  entrepriseNom: "",
  institutions: "",
  vehicule: "",
  autresBiens: "",
  notes: "",
  notaireNom: "",
  notaireCourriel: "",
};

// Sections structurées : [{ titre, items: [{ label, valeur }] }]
// Les items sans valeur sont rendus avec « — » (le notaire sait quoi demander).
export function construireSections(dossier = {}, reponses = {}, faits = {}) {
  const d = { ...DOSSIER_VIDE, ...dossier };
  const ech = calculerEcheances(reponses.dateDeces);
  const oui = (b) => (b ? "Oui" : "Non");
  const sections = [];

  sections.push({
    titre: "Personne décédée",
    items: [
      { label: "Nom complet", valeur: val(d.defuntNom) },
      { label: "Date de naissance", valeur: formatDateIso(d.defuntNaissance) },
      { label: "Date du décès", valeur: formatDateIso(reponses.dateDeces) },
      { label: "Dernier domicile", valeur: val(d.defuntAdresse) },
      {
        label: "Situation conjugale",
        valeur: LIBELLES_REPONSES.conjugal[reponses.conjugal] || null,
      },
    ],
  });

  sections.push({
    titre: "Personne qui transmet ce dossier",
    items: [
      { label: "Nom", valeur: val(d.demandeurNom) },
      { label: "Rôle", valeur: LIBELLES_REPONSES.role[reponses.role] || null },
      { label: "Téléphone", valeur: val(d.demandeurTelephone) },
      { label: "Courriel", valeur: val(d.demandeurCourriel) },
    ],
  });

  if (reponses.conjugal && reponses.conjugal !== "aucun") {
    sections.push({
      titre: "Conjoint survivant",
      items: [
        { label: "Nom", valeur: val(d.conjointNom) },
        {
          label: "Statut",
          valeur:
            reponses.conjugal === "marie"
              ? "Marié ou uni civilement — patrimoine familial à liquider"
              : "Conjoint de fait",
        },
      ],
    });
  }

  sections.push({
    titre: "Testament",
    items: [
      {
        label: "Type",
        valeur: LIBELLES_REPONSES.testament[reponses.testament] || null,
      },
      reponses.testament === "notarie" && {
        label: "Notaire qui a reçu le testament",
        valeur: val(d.testamentNotaire),
      },
      {
        label: "Recherches testamentaires (Chambre des notaires et Barreau)",
        valeur: faits.recherche ? "Faites" : "À faire",
      },
    ].filter(Boolean),
  });

  const heritiers = (d.heritiers || []).filter((h) => val(h.nom) || val(h.lien));
  sections.push({
    titre: "Héritiers connus",
    items: heritiers.length
      ? heritiers.map((h, i) => ({
          label: `Héritier ${i + 1}`,
          valeur: [val(h.nom), val(h.lien)].filter(Boolean).join(" — ") || null,
        }))
      : [{ label: "Héritiers", valeur: null }],
  });

  sections.push({
    titre: "Patrimoine",
    items: [
      reponses.immeuble && {
        label: "Immeuble",
        valeur: val(d.immeubleAdresse) || "Oui — adresse à préciser",
      },
      reponses.entreprise && {
        label: "Entreprise ou parts de société",
        valeur: val(d.entrepriseNom) || "Oui — détails à préciser",
      },
      { label: "REER / FERR / CELI", valeur: oui(reponses.reer) },
      { label: "Institutions financières", valeur: val(d.institutions) },
      { label: "Véhicule", valeur: val(d.vehicule) },
      { label: "Autres biens importants", valeur: val(d.autresBiens) },
    ].filter(Boolean),
  });

  const vigilance = [
    reponses.mineurs && {
      label: "Héritiers mineurs",
      valeur: "Oui — tutelle et avis au Curateur public à prévoir",
    },
    reponses.solvabilite === "incertaine" && {
      label: "Solvabilité",
      valeur: "Incertaine — aucun paiement fait avant conseil, ordre de priorité à valider",
    },
    ech && {
      label: "Date limite des déclarations de revenus finales",
      valeur: ech.impots,
    },
    ech && {
      label: "Fin du délai de réflexion de 6 mois des héritiers",
      valeur: ech.option6mois,
    },
  ].filter(Boolean);
  if (vigilance.length) {
    sections.push({ titre: "Points de vigilance", items: vigilance });
  }

  const enMain = DOCUMENTS.filter((doc) => faits[doc.id]).map((doc) => doc.t);
  const manquants = DOCUMENTS.filter((doc) => !faits[doc.id]).map((doc) => doc.t);
  sections.push({
    titre: "Documents",
    items: [
      { label: "Déjà en main", valeur: enMain.length ? enMain.join("; ") : "Aucun pour l'instant" },
      { label: "À retrouver", valeur: manquants.length ? manquants.join("; ") : "Aucun" },
    ],
  });

  if (val(d.notes)) {
    sections.push({
      titre: "Notes et questions pour le notaire",
      items: [{ label: "Notes", valeur: val(d.notes) }],
    });
  }

  return sections;
}

const AVERTISSEMENT =
  "Document préparé par le client avec Héritia à des fins d'information. Les renseignements n'ont pas été vérifiés et ne constituent ni un acte ni un mandat.";

export function dossierEnTexte(dossier, reponses, faits) {
  const lignes = [
    "DOSSIER DE SUCCESSION",
    `Préparé avec Héritia le ${FORMAT_DATE.format(new Date())}`,
    "",
  ];
  for (const s of construireSections(dossier, reponses, faits)) {
    lignes.push(s.titre.toUpperCase());
    for (const item of s.items) {
      lignes.push(`  ${item.label} : ${item.valeur || "—"}`);
    }
    lignes.push("");
  }
  lignes.push(AVERTISSEMENT);
  return lignes.join("\n");
}

const echapper = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Document HTML autonome (téléchargement), dans l'identité visuelle d'Héritia.
export function dossierEnHtml(dossier, reponses, faits) {
  const sections = construireSections(dossier, reponses, faits)
    .map(
      (s) => `
    <section>
      <h2>${echapper(s.titre)}</h2>
      <table>${s.items
        .map(
          (item) =>
            `<tr><th>${echapper(item.label)}</th><td>${echapper(item.valeur || "—")}</td></tr>`
        )
        .join("")}</table>
    </section>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Dossier de succession — Héritia</title>
<style>
  body { font-family: Georgia, serif; color: #1f2b38; max-width: 720px; margin: 40px auto; padding: 0 24px; line-height: 1.5; }
  .marque { letter-spacing: 0.3em; font-size: 13px; color: #b8923e; font-weight: 600; }
  h1 { font-size: 26px; margin: 8px 0 4px; }
  .date { color: #6e6759; font-size: 14px; margin-bottom: 28px; }
  h2 { font-size: 17px; border-bottom: 1px solid #e4ddd0; padding-bottom: 6px; margin: 26px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 14.5px; font-family: system-ui, sans-serif; }
  th { text-align: left; vertical-align: top; padding: 5px 16px 5px 0; width: 38%; font-weight: 600; color: #46556a; }
  td { padding: 5px 0; }
  .avertissement { margin-top: 36px; font-size: 12px; color: #6e6759; border-top: 1px solid #e4ddd0; padding-top: 12px; font-family: system-ui, sans-serif; }
</style>
</head>
<body>
<div class="marque">HÉRITIA</div>
<h1>Dossier de succession</h1>
<div class="date">Préparé le ${echapper(FORMAT_DATE.format(new Date()))}</div>
${sections}
<p class="avertissement">${echapper(AVERTISSEMENT)}</p>
</body>
</html>`;
}
