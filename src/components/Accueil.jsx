export default function Accueil({ onStart }) {
  return (
    <main className="accueil">
      <div className="marque">HÉRITIA</div>
      <h1>
        Régler une succession,
        <br />
        une étape à la fois.
      </h1>
      <p className="accueil-lead">
        Liquider une succession au Québec, c'est un rôle exigeant que la plupart des
        gens n'exercent qu'une fois dans leur vie. Héritia construit votre parcours
        personnalisé, vous explique chaque étape en français clair et vous indique
        les délais à surveiller — à votre rythme.
      </p>
      <button className="btn-or" onClick={onStart}>
        Commencer mon parcours
      </button>

      <ul className="accueil-points">
        <li>
          <strong>Personnalisé</strong> — quatre questions suffisent pour adapter le
          parcours à votre situation : testament, immeuble, entreprise, rôle.
        </li>
        <li>
          <strong>Concret</strong> — chaque étape précise quoi faire, auprès de qui,
          dans quel délai, avec des liens vers les ressources officielles.
        </li>
        <li>
          <strong>À votre rythme</strong> — cochez les étapes accomplies; votre
          progression est conservée sur cet appareil.
        </li>
      </ul>
    </main>
  );
}
