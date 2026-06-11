import { useState } from "react";
import { QUESTIONS } from "../data/parcours.js";

export default function Questionnaire({ reponsesInitiales, onDone }) {
  const [i, setI] = useState(0);
  const [r, setR] = useState(reponsesInitiales || {});
  const q = QUESTIONS[i];

  const choisir = (v) => {
    const nr = { ...r, [q.cle]: v };
    if (i + 1 < QUESTIONS.length) {
      setR(nr);
      setI(i + 1);
    } else {
      onDone(nr);
    }
  };

  return (
    <main className="questionnaire">
      <div className="progres" role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS.length} aria-valuenow={i + 1}>
        {QUESTIONS.map((_, j) => (
          <div key={j} className={`progres-seg${j <= i ? " actif" : ""}`} />
        ))}
      </div>
      <div className="q-num">
        Question {i + 1} de {QUESTIONS.length}
      </div>
      <h2>{q.q}</h2>
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
      {q.aide && <p className="q-aide">{q.aide}</p>}
      {i > 0 && (
        <button className="btn-discret" onClick={() => setI(i - 1)}>
          ← Question précédente
        </button>
      )}
    </main>
  );
}
