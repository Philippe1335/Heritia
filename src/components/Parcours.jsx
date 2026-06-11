import { useState } from "react";
import { LIBELLES_REPONSES } from "../data/parcours.js";

const INTRO_ROLE = {
  liquidateur:
    "Voici votre parcours de liquidateur, dans l'ordre où les étapes se présentent habituellement. Les délais et les mises en garde signalent ce qui ne peut pas attendre.",
  heritier:
    "Comme héritier, vous n'êtes pas chargé de la liquidation, mais vous avez des droits (consulter l'inventaire, recevoir le compte) et une décision importante à prendre : accepter ou renoncer. Ce parcours vous montre tout le processus pour suivre le travail du liquidateur.",
  preparation:
    "Vous vous informez à l'avance — une excellente idée. Voici le déroulement complet d'une liquidation au Québec, pour savoir à quoi vous attendre le moment venu.",
};

function Tache({ tache, fait, ouvert, onBasculer, onOuvrir }) {
  return (
    <div className={`tache${fait ? " faite" : ""}`}>
      <button
        className={`case${fait ? " cochee" : ""}`}
        aria-label={fait ? "Marquer comme à faire" : "Marquer comme faite"}
        aria-pressed={fait}
        onClick={onBasculer}
      >
        {fait && "✓"}
      </button>
      <div className="tache-corps">
        <button className="tache-titre" onClick={onOuvrir} aria-expanded={ouvert}>
          <span className={fait ? "barre" : ""}>{tache.titre}</span>
          <span className="chevron" aria-hidden="true">
            {ouvert ? "−" : "+"}
          </span>
        </button>
        {(tache.delai || tache.notaire) && (
          <div className="badges">
            {tache.notaire && <span className="badge badge-notaire">Notaire requis</span>}
            {tache.delai && <span className="badge badge-delai">{tache.delai}</span>}
          </div>
        )}
        <div className={`tache-detail${ouvert ? " ouvert" : ""}`}>
          <p>{tache.description}</p>
          {tache.attention && (
            <p className="attention">
              <strong>Attention&nbsp;:</strong> {tache.attention}
            </p>
          )}
          {tache.liens && (
            <p className="liens">
              {tache.liens.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Parcours({
  phases,
  reponses,
  faits,
  onBasculerFait,
  onModifier,
  onRecommencer,
}) {
  const [ouvert, setOuvert] = useState(null);

  const total = phases.reduce((n, p) => n + p.taches.length, 0);
  const nbFaits = phases.reduce(
    (n, p) => n + p.taches.filter((t) => faits[t.id]).length,
    0
  );

  const etiquettes = [
    LIBELLES_REPONSES.testament[reponses.testament],
    LIBELLES_REPONSES.immeuble[String(reponses.immeuble)],
    LIBELLES_REPONSES.entreprise[String(reponses.entreprise)],
    LIBELLES_REPONSES.role[reponses.role],
  ];

  return (
    <main className="parcours">
      <header className="parcours-entete">
        <div>
          <div className="marque marque-petite">HÉRITIA</div>
          <h2>Votre parcours de liquidation</h2>
        </div>
        <div className="compteur">
          <span className="compteur-num">{nbFaits}</span>
          <span className="compteur-sur">/ {total} étapes</span>
        </div>
      </header>

      <div className="resume">
        {etiquettes.map((e) => (
          <span key={e} className="puce">
            {e}
          </span>
        ))}
        <button className="btn-discret" onClick={onModifier}>
          Modifier mes réponses
        </button>
      </div>

      <p className="intro-role">{INTRO_ROLE[reponses.role]}</p>

      {phases.map((p, pi) => {
        const faitsPhase = p.taches.filter((t) => faits[t.id]).length;
        return (
          <section key={p.id} className="phase">
            <div className="phase-entete">
              <div>
                <div className="phase-titre">
                  <span className="phase-numero">{pi + 1}</span>
                  {p.titre}
                </div>
                <div className="phase-sous">{p.sousTitre}</div>
              </div>
              <div className="phase-progres">
                {faitsPhase} / {p.taches.length}
              </div>
            </div>
            {p.taches.map((t) => (
              <Tache
                key={t.id}
                tache={t}
                fait={!!faits[t.id]}
                ouvert={ouvert === t.id}
                onBasculer={() => onBasculerFait(t.id)}
                onOuvrir={() => setOuvert(ouvert === t.id ? null : t.id)}
              />
            ))}
          </section>
        );
      })}

      <div className="parcours-actions">
        <button className="btn-discret" onClick={() => window.print()}>
          Imprimer ma liste
        </button>
        <button className="btn-discret danger" onClick={onRecommencer}>
          Recommencer à zéro
        </button>
      </div>
    </main>
  );
}
