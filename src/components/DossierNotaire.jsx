import {
  construireSections,
  dossierEnHtml,
  dossierEnTexte,
  DOSSIER_VIDE,
} from "../data/dossier.js";

function Champ({ label, valeur, onChange, type = "text", placeholder }) {
  return (
    <label className="champ">
      <span>{label}</span>
      <input type={type} value={valeur || ""} placeholder={placeholder} onChange={onChange} />
    </label>
  );
}

export default function DossierNotaire({ dossier, reponses, faits, onMaj, onRetour }) {
  const d = { ...DOSSIER_VIDE, ...dossier };
  const set = (cle) => (e) => onMaj({ ...d, [cle]: e.target.value });

  const heritiers = d.heritiers.length ? d.heritiers : [{ nom: "", lien: "" }];
  const setHeritier = (i, cle) => (e) => {
    const copie = heritiers.map((h, j) => (j === i ? { ...h, [cle]: e.target.value } : h));
    onMaj({ ...d, heritiers: copie });
  };
  const ajouterHeritier = () => onMaj({ ...d, heritiers: [...heritiers, { nom: "", lien: "" }] });
  const retirerHeritier = (i) =>
    onMaj({ ...d, heritiers: heritiers.filter((_, j) => j !== i) });

  const telecharger = () => {
    const blob = new Blob([dossierEnHtml(d, reponses, faits)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dossier-succession-heritia.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const courriel = () => {
    const sujet = `Dossier de succession${d.defuntNom ? " — " + d.defuntNom : ""}`;
    const intro = d.notaireNom ? `Bonjour ${d.notaireNom},\n\n` : "Bonjour,\n\n";
    const corps =
      intro +
      "Vous trouverez ci-dessous le dossier de la succession, préparé avec Héritia. " +
      "Je joins aussi la version mise en page téléchargée depuis l'application.\n\n" +
      dossierEnTexte(d, reponses, faits);
    window.location.href = `mailto:${encodeURIComponent(d.notaireCourriel || "")}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  };

  const sections = construireSections(d, reponses, faits);

  return (
    <main className="dossier">
      <div className="no-print">
        <div className="marque marque-petite">HÉRITIA</div>
        <h2>Votre dossier pour le notaire</h2>
        <p className="dossier-intro">
          Remplissez ce que vous savez — le notaire complétera le reste. L'aperçu se met à
          jour au fur et à mesure, et vos informations restent uniquement sur cet appareil.
          Les renseignements sensibles (numéro d'assurance sociale, mots de passe) ne sont
          pas demandés ici : le notaire les recueillera lui-même de façon sécurisée.
        </p>

        <form className="dossier-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Personne décédée</legend>
            <Champ label="Nom complet" valeur={d.defuntNom} onChange={set("defuntNom")} />
            <Champ
              label="Date de naissance"
              type="date"
              valeur={d.defuntNaissance}
              onChange={set("defuntNaissance")}
            />
            <Champ
              label="Dernier domicile (adresse)"
              valeur={d.defuntAdresse}
              onChange={set("defuntAdresse")}
            />
          </fieldset>

          <fieldset>
            <legend>Vous</legend>
            <Champ label="Votre nom" valeur={d.demandeurNom} onChange={set("demandeurNom")} />
            <Champ
              label="Téléphone"
              type="tel"
              valeur={d.demandeurTelephone}
              onChange={set("demandeurTelephone")}
            />
            <Champ
              label="Courriel"
              type="email"
              valeur={d.demandeurCourriel}
              onChange={set("demandeurCourriel")}
            />
          </fieldset>

          {reponses.conjugal !== "aucun" && (
            <fieldset>
              <legend>Conjoint survivant</legend>
              <Champ label="Nom du conjoint" valeur={d.conjointNom} onChange={set("conjointNom")} />
            </fieldset>
          )}

          {reponses.testament === "notarie" && (
            <fieldset>
              <legend>Testament</legend>
              <Champ
                label="Notaire qui a reçu le testament (si connu)"
                valeur={d.testamentNotaire}
                placeholder="Nom et ville"
                onChange={set("testamentNotaire")}
              />
            </fieldset>
          )}

          <fieldset>
            <legend>Héritiers connus</legend>
            {heritiers.map((h, i) => (
              <div className="heritier-rangee" key={i}>
                <Champ label={`Nom de l'héritier ${i + 1}`} valeur={h.nom} onChange={setHeritier(i, "nom")} />
                <Champ
                  label="Lien avec le défunt"
                  valeur={h.lien}
                  placeholder="Ex. : fille, 16 ans"
                  onChange={setHeritier(i, "lien")}
                />
                {heritiers.length > 1 && (
                  <button type="button" className="btn-discret danger" onClick={() => retirerHeritier(i)}>
                    Retirer
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-discret" onClick={ajouterHeritier}>
              + Ajouter un héritier
            </button>
          </fieldset>

          <fieldset>
            <legend>Patrimoine</legend>
            {reponses.immeuble && (
              <Champ
                label="Adresse de l'immeuble"
                valeur={d.immeubleAdresse}
                onChange={set("immeubleAdresse")}
              />
            )}
            {reponses.entreprise && (
              <Champ
                label="Nom de l'entreprise ou de la société"
                valeur={d.entrepriseNom}
                onChange={set("entrepriseNom")}
              />
            )}
            <Champ
              label="Institutions financières (banques, caisses)"
              valeur={d.institutions}
              placeholder="Ex. : Desjardins, Banque Nationale"
              onChange={set("institutions")}
            />
            <Champ label="Véhicule (marque, année)" valeur={d.vehicule} onChange={set("vehicule")} />
            <Champ
              label="Autres biens importants"
              valeur={d.autresBiens}
              placeholder="Ex. : chalet, placements, œuvres d'art"
              onChange={set("autresBiens")}
            />
          </fieldset>

          <fieldset>
            <legend>Notes et questions pour le notaire</legend>
            <label className="champ">
              <span>Tout ce qui vous semble utile ou vous inquiète</span>
              <textarea rows={4} value={d.notes} onChange={set("notes")} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Votre notaire (si vous en avez déjà un)</legend>
            <Champ label="Nom" valeur={d.notaireNom} onChange={set("notaireNom")} />
            <Champ
              label="Courriel"
              type="email"
              valeur={d.notaireCourriel}
              onChange={set("notaireCourriel")}
            />
          </fieldset>
        </form>

        <div className="dossier-actions">
          <button className="btn-or" onClick={() => window.print()}>
            Imprimer / Enregistrer en PDF
          </button>
          <button className="btn-or" onClick={telecharger}>
            Télécharger le document
          </button>
          <button className="btn-or" onClick={courriel}>
            Ouvrir un courriel au notaire
          </button>
          <button className="btn-discret" onClick={onRetour}>
            ← Retour au parcours
          </button>
        </div>
        <p className="q-aide">
          « Imprimer / Enregistrer en PDF » produit la version officielle à joindre; le bouton
          courriel prépare un message avec le contenu du dossier — joignez-y le document
          téléchargé.
        </p>
      </div>

      <section className="document" aria-label="Aperçu du dossier">
        <div className="marque marque-petite">HÉRITIA</div>
        <h3 className="document-titre">Dossier de succession</h3>
        {sections.map((s) => (
          <div key={s.titre} className="document-section">
            <h4>{s.titre}</h4>
            <table>
              <tbody>
                {s.items.map((item, i) => (
                  <tr key={i}>
                    <th>{item.label}</th>
                    <td>{item.valeur || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <p className="document-avertissement">
          Document préparé par le client avec Héritia à des fins d'information. Les
          renseignements n'ont pas été vérifiés et ne constituent ni un acte ni un mandat.
        </p>
      </section>
    </main>
  );
}
