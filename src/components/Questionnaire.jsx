import { useState } from "react";
import { QUESTIONS } from "../data/parcours.js";

const applicables = (r) => QUESTIONS.filter((q) => !q.si || q.si(r));

export default function Questionnaire({ reponsesInitiales, onDone }) {
  const [i, setI] = useState(0);
  const [r, setR] = useState(reponsesInitiales || {});
  const liste = applicables(r);
  const q = liste[i];
  const [dateSaisie, setDateSaisie] = useState(r.dateDeces || "");

  const choisir = (v) => {
    const nr = { ...r, [q.cle]: v };
    // la liste peut raccourcir : « je m'informe à l'avance » retire la question de date
    if (i + 1 < applicables(nr).length) {
      setR(nr);
      setI(i + 1);
    } else {
      onDone(nr);
    }
  };

  return (
    <main className="questionnaire">
      <div
        className="progres"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={liste.length}
        aria-valuenow={i + 1}
      >
        {liste.map((_, j) => (
          <div key={j} className={`progres-seg${j <= i ? " actif" : ""}`} />
        ))}
      </div>
      <div className="q-num">
        Question {i + 1} de {liste.length}
      </div>
      <h2>{q.q}</h2>

      {q.type === "date" ? (
        <div className="date-bloc">
          <input
            type="date"
            className="date-input"
            value={dateSaisie}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateSaisie(e.target.value)}
            aria-label="Date du décès"
          />
          <div className="date-actions">
            <button className="btn-or" disabled={!dateSaisie} onClick={() => choisir(dateSaisie)}>
              Continuer
            </button>
            <button className="btn-discret" onClick={() => choisir(null)}>
              Je préfère ne pas préciser
            </button>
          </div>
        </div>
      ) : (
        <div className="opt-liste">
          {q.options.map((o) => (
            <button
              key={String(o.v)}
              className={`btn-option${r[q.cle] === o.v ? " choisi" : ""}`}
              onClick={() => choisir(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}

      {q.aide && <p className="q-aide">{q.aide}</p>}
      {i > 0 && (
        <button className="btn-discret" onClick={() => setI(i - 1)}>
          ← Question précédente
        </button>
      )}
    </main>
  );
}
