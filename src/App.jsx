import { useEffect, useState } from "react";
import Accueil from "./components/Accueil.jsx";
import Questionnaire from "./components/Questionnaire.jsx";
import Parcours from "./components/Parcours.jsx";
import DossierNotaire from "./components/DossierNotaire.jsx";
import Assistant, { URL_ASSISTANT } from "./components/Assistant.jsx";
import { buildParcours, CLES_REQUISES } from "./data/parcours.js";

const CLE_STOCKAGE = "heritia-v1";

const reponsesCompletes = (r) => r && CLES_REQUISES.every((c) => r[c] !== undefined);

function chargerEtat() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;
    const etat = JSON.parse(brut);
    if (etat && etat.reponses && etat.reponses.testament != null) return etat;
  } catch {
    // stockage corrompu ou inaccessible : on repart de zéro
  }
  return null;
}

export default function App() {
  const [etat, setEtat] = useState(() => {
    const sauvegarde = chargerEtat();
    if (!sauvegarde) return { ecran: "accueil", reponses: null, faits: {}, dossier: {} };
    return {
      // une sauvegarde d'une version antérieure (questions manquantes) renvoie
      // au questionnaire prérempli plutôt qu'à un parcours incomplet
      ecran: reponsesCompletes(sauvegarde.reponses) ? "parcours" : "questionnaire",
      reponses: sauvegarde.reponses,
      faits: sauvegarde.faits || {},
      dossier: sauvegarde.dossier || {},
    };
  });
  const [chatOuvert, setChatOuvert] = useState(false);

  useEffect(() => {
    if ((etat.ecran === "parcours" || etat.ecran === "dossier") && etat.reponses) {
      try {
        localStorage.setItem(
          CLE_STOCKAGE,
          JSON.stringify({ reponses: etat.reponses, faits: etat.faits, dossier: etat.dossier })
        );
      } catch {
        // mode privé ou quota dépassé : la progression ne sera simplement pas conservée
      }
    }
  }, [etat]);

  const demarrer = () => setEtat((e) => ({ ...e, ecran: "questionnaire" }));

  const terminerQuestionnaire = (reponses) =>
    setEtat((e) => ({ ecran: "parcours", reponses, faits: e.faits }));

  const modifierReponses = () => setEtat((e) => ({ ...e, ecran: "questionnaire" }));

  const recommencer = () => {
    try {
      localStorage.removeItem(CLE_STOCKAGE);
    } catch {
      // rien à faire
    }
    setEtat({ ecran: "accueil", reponses: null, faits: {}, dossier: {} });
  };

  const basculerFait = (id) =>
    setEtat((e) => ({ ...e, faits: { ...e.faits, [id]: !e.faits[id] } }));

  const ouvrirDossier = () => setEtat((e) => ({ ...e, ecran: "dossier" }));
  const fermerDossier = () => setEtat((e) => ({ ...e, ecran: "parcours" }));
  const majDossier = (dossier) => setEtat((e) => ({ ...e, dossier }));

  return (
    <div className="app">
      {etat.ecran === "accueil" && <Accueil onStart={demarrer} />}
      {etat.ecran === "questionnaire" && (
        <Questionnaire
          reponsesInitiales={etat.reponses}
          onDone={terminerQuestionnaire}
        />
      )}
      {etat.ecran === "parcours" && (
        <Parcours
          phases={buildParcours(etat.reponses)}
          reponses={etat.reponses}
          faits={etat.faits}
          onBasculerFait={basculerFait}
          onModifier={modifierReponses}
          onRecommencer={recommencer}
          onDossier={ouvrirDossier}
          onChat={URL_ASSISTANT ? () => setChatOuvert(true) : null}
        />
      )}
      {etat.ecran === "dossier" && (
        <DossierNotaire
          dossier={etat.dossier}
          reponses={etat.reponses}
          faits={etat.faits}
          onMaj={majDossier}
          onRetour={fermerDossier}
        />
      )}
      {chatOuvert && (
        <Assistant reponses={etat.reponses} onClose={() => setChatOuvert(false)} />
      )}
      <footer className="pied">
        <p>
          Héritia est un outil d'information et d'organisation. Il ne remplace pas les
          conseils d'un notaire ou d'un avocat, et certains actes (vérification de
          testament, déclaration de transmission immobilière) exigent légalement un
          notaire.
        </p>
      </footer>
    </div>
  );
}
