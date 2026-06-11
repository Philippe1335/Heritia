import { useEffect, useState } from "react";
import Accueil from "./components/Accueil.jsx";
import Questionnaire from "./components/Questionnaire.jsx";
import Parcours from "./components/Parcours.jsx";
import { buildParcours } from "./data/parcours.js";

const CLE_STOCKAGE = "heritia-v1";

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
    return sauvegarde
      ? { ecran: "parcours", reponses: sauvegarde.reponses, faits: sauvegarde.faits || {} }
      : { ecran: "accueil", reponses: null, faits: {} };
  });

  useEffect(() => {
    if (etat.ecran === "parcours" && etat.reponses) {
      try {
        localStorage.setItem(
          CLE_STOCKAGE,
          JSON.stringify({ reponses: etat.reponses, faits: etat.faits })
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
    setEtat({ ecran: "accueil", reponses: null, faits: {} });
  };

  const basculerFait = (id) =>
    setEtat((e) => ({ ...e, faits: { ...e.faits, [id]: !e.faits[id] } }));

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
        />
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
