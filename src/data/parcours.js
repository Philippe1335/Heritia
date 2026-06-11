// Parcours de liquidation d'une succession au Québec.
// Le parcours est construit dynamiquement selon les réponses au questionnaire :
// { testament: "notarie" | "olographe" | "aucun",
//   immeuble: bool, entreprise: bool,
//   conjugal: "marie" | "fait" | "aucun",
//   mineurs: bool, reer: bool,
//   solvabilite: "solvable" | "incertaine",
//   role: "liquidateur" | "heritier" | "preparation",
//   dateDeces: "AAAA-MM-JJ" | null }
//
// Chaque tâche : { id, titre, description, delai?, attention?, notaire?, liens?, sousTaches? }
// - delai : repère temporel ou échéance légale, affiché en badge (calculé à
//   partir de la date du décès quand elle est connue)
// - attention : mise en garde importante, affichée en encadré
// - notaire : true si l'acte exige légalement un notaire
// - liens : ressources officielles [{ label, url }]
// - sousTaches : aide-mémoire cochable [{ id, t }]

export const QUESTIONS = [
  {
    cle: "testament",
    q: "Le défunt avait-il un testament?",
    aide: "Si vous ne savez pas, choisissez « Non, ou je ne sais pas » — la recherche testamentaire fera partie de votre parcours dans tous les cas.",
    options: [
      { v: "notarie", l: "Oui, un testament notarié" },
      { v: "olographe", l: "Oui, écrit à la main ou devant témoins" },
      { v: "aucun", l: "Non, ou je ne sais pas" },
    ],
  },
  {
    cle: "immeuble",
    q: "La succession comprend-elle un immeuble (maison, condo, terrain)?",
    aide: "Un immeuble situé au Québec exige une déclaration de transmission notariée avant de pouvoir être transféré ou vendu.",
    options: [
      { v: true, l: "Oui" },
      { v: false, l: "Non" },
    ],
  },
  {
    cle: "entreprise",
    q: "Le défunt possédait-il une entreprise ou des parts de société?",
    aide: "Entreprise individuelle, parts de société, actions d'une compagnie : ces actifs demandent des démarches particulières et rapides.",
    options: [
      { v: true, l: "Oui" },
      { v: false, l: "Non" },
    ],
  },
  {
    cle: "conjugal",
    q: "Quelle était la situation conjugale du défunt?",
    aide: "Le mariage ou l'union civile déclenche la liquidation du patrimoine familial; le conjoint de fait n'a pas les mêmes droits.",
    options: [
      { v: "marie", l: "Marié ou uni civilement" },
      { v: "fait", l: "Conjoint de fait" },
      { v: "aucun", l: "Sans conjoint (célibataire, divorcé, veuf)" },
    ],
  },
  {
    cle: "mineurs",
    q: "Des héritiers sont-ils mineurs (moins de 18 ans)?",
    aide: "La part d'un mineur est encadrée par la loi : tutelle, avis au Curateur public et, selon la valeur, conseil de tutelle.",
    options: [
      { v: true, l: "Oui" },
      { v: false, l: "Non" },
    ],
  },
  {
    cle: "reer",
    q: "Le défunt détenait-il des REER, FERR ou CELI?",
    aide: "Ces régimes ont des règles fiscales particulières au décès — un roulement au conjoint peut éviter beaucoup d'impôt.",
    options: [
      { v: true, l: "Oui" },
      { v: false, l: "Non, ou je ne sais pas" },
    ],
  },
  {
    cle: "solvabilite",
    q: "La succession risque-t-elle d'être insolvable (plus de dettes que de biens)?",
    aide: "En cas de doute, la prudence s'impose : payer des dettes dans le mauvais ordre peut engager votre responsabilité personnelle.",
    options: [
      { v: "solvable", l: "Non, les biens dépassent clairement les dettes" },
      { v: "incertaine", l: "Oui, ou c'est incertain" },
    ],
  },
  {
    cle: "role",
    q: "Quel est votre rôle dans cette succession?",
    aide: "Votre parcours sera adapté : un héritier n'a pas les mêmes obligations qu'un liquidateur.",
    options: [
      { v: "liquidateur", l: "Je suis liquidateur (ou je le deviendrai)" },
      { v: "heritier", l: "Je suis héritier" },
      { v: "preparation", l: "Je m'informe à l'avance" },
    ],
  },
  {
    cle: "dateDeces",
    q: "Quand le décès est-il survenu?",
    aide: "La date permet de calculer vos échéances réelles : délai pour renoncer, date limite des déclarations de revenus, prestation de décès.",
    type: "date",
    si: (r) => r.role !== "preparation",
  },
];

export const CLES_REQUISES = [
  "testament",
  "immeuble",
  "entreprise",
  "conjugal",
  "mineurs",
  "reer",
  "solvabilite",
  "role",
];

export const LIBELLES_REPONSES = {
  testament: {
    notarie: "Testament notarié",
    olographe: "Testament olographe ou devant témoins",
    aucun: "Sans testament connu",
  },
  immeuble: { true: "Avec immeuble", false: "Sans immeuble" },
  entreprise: { true: "Avec entreprise", false: "Sans entreprise" },
  conjugal: {
    marie: "Conjoint marié ou uni civilement",
    fait: "Conjoint de fait",
    aucun: "Sans conjoint",
  },
  role: {
    liquidateur: "Liquidateur",
    heritier: "Héritier",
    preparation: "En préparation",
  },
};

const LIENS = {
  etatCivil: {
    label: "Directeur de l'état civil",
    url: "https://www.quebec.ca/famille-et-soutien-aux-personnes/deces/declaration-deces-obtention-certificat-copie-acte",
  },
  rechercheNotaires: {
    label: "Recherche testamentaire — Chambre des notaires",
    url: "https://www.cnq.org/services-au-public/recherche-de-testament-et-mandat/",
  },
  rechercheBarreau: {
    label: "Recherche testamentaire — Barreau du Québec",
    url: "https://www.barreau.qc.ca/fr/services-public/registres-testaments-mandats/",
  },
  retraiteQc: {
    label: "Retraite Québec — prestations de décès",
    url: "https://www.rrq.gouv.qc.ca/fr/deces/Pages/deces.aspx",
  },
  quebecDeces: {
    label: "Québec.ca — Que faire lors d'un décès",
    url: "https://www.quebec.ca/famille-et-soutien-aux-personnes/deces",
  },
  revenuQc: {
    label: "Revenu Québec — succession",
    url: "https://www.revenuquebec.ca/fr/citoyens/votre-situation/liquidateur-dune-succession/",
  },
  arc: {
    label: "ARC — déclaration finale",
    url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/evenements-vie/faire-impots-personne-decedee.html",
  },
  educaloi: {
    label: "Éducaloi — successions",
    url: "https://educaloi.qc.ca/categories-de-dossiers/deces-et-successions/",
  },
  soquij: {
    label: "Registre des droits personnels et réels mobiliers",
    url: "https://www.rdprm.gouv.qc.ca/fr/Pages/Deces.aspx",
  },
  curateur: {
    label: "Curateur public — succession et mineurs",
    url: "https://www.curateur.gouv.qc.ca/",
  },
};

export const DOCUMENTS = [
  { id: "doc-certificats", t: "Certificats de décès (plusieurs copies)" },
  { id: "doc-testament", t: "Testament et codicilles" },
  { id: "doc-mariage", t: "Contrat de mariage ou d'union civile" },
  { id: "doc-bancaires", t: "Relevés bancaires et de placements" },
  { id: "doc-assurances", t: "Polices d'assurance vie" },
  { id: "doc-propriete", t: "Titres de propriété et certificat de localisation" },
  { id: "doc-impots", t: "Déclarations de revenus des deux dernières années" },
  { id: "doc-dettes", t: "Factures, relevés de cartes de crédit et de prêts" },
  { id: "doc-logement", t: "Bail ou relevé hypothécaire" },
  { id: "doc-vehicule", t: "Certificat d'immatriculation du véhicule" },
  { id: "doc-cartes", t: "Cartes RAMQ et numéro d'assurance sociale" },
];

// ───── Calcul des échéances à partir de la date du décès ─────

const FORMAT_DATE = new Intl.DateTimeFormat("fr-CA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function versDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function plus(date, { jours = 0, mois = 0 }) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + mois);
  d.setDate(d.getDate() + jours);
  return d;
}

export function calculerEcheances(dateDecesIso) {
  const deces = versDate(dateDecesIso);
  if (!deces) return null;
  // Déclaration finale : 30 avril de l'année suivante, ou 6 mois après le
  // décès si celui-ci survient après le 31 octobre.
  const impots =
    deces.getMonth() >= 10
      ? plus(deces, { mois: 6 })
      : new Date(deces.getFullYear() + 1, 3, 30, 12);
  return {
    rrq60jours: FORMAT_DATE.format(plus(deces, { jours: 60 })),
    option6mois: FORMAT_DATE.format(plus(deces, { mois: 6 })),
    impots: FORMAT_DATE.format(impots),
  };
}

// ───── Construction du parcours ─────

export function buildParcours(r) {
  const estHeritier = r.role === "heritier";
  const ech = calculerEcheances(r.dateDeces);
  const phases = [];

  // ───── Phase 1 : Premiers jours ─────
  const t1 = [
    {
      id: "deces",
      titre: "Obtenir le constat et la déclaration de décès",
      description:
        "Le médecin remplit le constat de décès. Le directeur funéraire remplit ensuite la déclaration de décès avec un proche et la transmet au Directeur de l'état civil. Ces deux documents sont le point de départ de toutes les démarches.",
      liens: [LIENS.etatCivil],
    },
    {
      id: "certificat",
      titre: "Commander le certificat de décès",
      description:
        "Auprès du Directeur de l'état civil du Québec, en ligne, par la poste ou en personne. Prévoyez plusieurs copies : les banques, les assureurs et les gouvernements en exigeront chacun une.",
      delai: "Délai de traitement : quelques semaines — commandez tôt",
      liens: [LIENS.etatCivil],
    },
    {
      id: "funerailles",
      titre: "Organiser les funérailles",
      description:
        "Vérifiez d'abord si le défunt avait des arrangements funéraires préalables ou des volontés écrites (souvent dans le testament ou un contrat préalable). Les frais funéraires raisonnables sont une dette de la succession : conservez toutes les factures.",
    },
    {
      id: "documents",
      titre: "Rassembler les documents importants",
      description:
        "Un dossier complet vous fera gagner des mois. Cochez les documents au fur et à mesure que vous les retrouvez :",
      sousTaches: DOCUMENTS,
    },
    {
      id: "proteger",
      titre: "Sécuriser les biens de la succession",
      description:
        "Résidence, véhicule, objets de valeur : assurez-vous qu'ils sont protégés et assurés. Le liquidateur doit agir avec prudence et diligence dès le décès, comme le ferait un administrateur du bien d'autrui.",
      attention:
        "Ne distribuez rien et ne videz pas la maison pour l'instant : l'inventaire doit d'abord être dressé.",
    },
  ];

  if (r.solvabilite === "incertaine") {
    t1.push({
      id: "solvabilite",
      titre: "Suspendre tout paiement tant que la solvabilité n'est pas claire",
      description:
        "Si les dettes risquent de dépasser les biens, ne payez aucun créancier (sauf les frais funéraires raisonnables) avant que l'inventaire soit dressé. La loi impose un ordre de paiement strict, et un héritier qui utilise les biens de la succession peut être réputé l'avoir acceptée — avec ses dettes.",
      attention:
        "Succession possiblement insolvable : consultez un notaire ou un avocat avant de payer quoi que ce soit ou de toucher aux biens.",
    });
  }

  phases.push({
    id: "premiers-jours",
    titre: "Premiers jours",
    sousTitre: "Les démarches immédiates après le décès",
    taches: t1,
  });

  // ───── Phase 2 : Premières semaines ─────
  const t2 = [
    {
      id: "recherche",
      titre: "Faire les recherches testamentaires",
      description:
        "Obligatoire même si vous avez un testament en main : demandez un certificat de recherche à la Chambre des notaires ET au Barreau du Québec pour confirmer qu'il s'agit bien du dernier testament. Le certificat de décès est requis pour la demande.",
      liens: [LIENS.rechercheNotaires, LIENS.rechercheBarreau],
    },
  ];

  if (r.testament === "notarie") {
    t2.push({
      id: "copie-testament",
      titre: "Obtenir une copie authentique du testament notarié",
      description:
        "Demandez-la au notaire qui a reçu le testament (ou à son cessionnaire de greffe). Avantage majeur du testament notarié : il n'a pas besoin d'être vérifié par le tribunal et prend effet immédiatement.",
    });
  } else if (r.testament === "olographe") {
    t2.push({
      id: "verification",
      titre: "Faire vérifier le testament par un notaire ou le tribunal",
      description:
        "Un testament olographe (écrit à la main) ou devant témoins doit obligatoirement être vérifié par la Cour supérieure ou par un notaire avant de produire ses effets. Sans cette vérification, les institutions refuseront d'agir.",
      notaire: true,
      delai: "Comptez de 4 à 8 semaines pour la procédure",
    });
  } else {
    t2.push(
      {
        id: "heritiers-legaux",
        titre: "Identifier les héritiers légaux (succession ab intestat)",
        description:
          "Sans testament, le Code civil du Québec détermine qui hérite : le conjoint marié ou uni civilement et les proches parents, selon des proportions fixées par la loi (par exemple, 1/3 au conjoint et 2/3 aux enfants).",
        attention:
          "Le conjoint de fait n'hérite PAS sans testament au Québec, peu importe la durée de la vie commune.",
        liens: [LIENS.educaloi],
      },
      {
        id: "designation-liquidateur",
        titre: "Faire désigner le liquidateur",
        description:
          "Sans testament, les héritiers sont collectivement chargés de la liquidation. Ils peuvent — et devraient — désigner un liquidateur à la majorité, idéalement par écrit.",
      }
    );
  }

  if (r.conjugal === "fait") {
    t2.push({
      id: "conjoint-fait",
      titre: "Vérifier les droits du conjoint de fait survivant",
      description:
        "Le conjoint de fait n'hérite pas sans testament, mais il peut avoir d'autres droits : rente de conjoint survivant du RRQ, produits d'assurance vie s'il est bénéficiaire désigné, droits prévus dans un contrat de vie commune, ou recours pour enrichissement injustifié dans certains cas. Vérifiez chaque source séparément.",
      liens: [LIENS.retraiteQc, LIENS.educaloi],
    });
  }

  if (estHeritier) {
    t2.push({
      id: "option",
      titre: "Décider d'accepter ou de renoncer à la succession",
      description:
        "Comme héritier, vous avez le droit d'accepter ou de renoncer à la succession. Si la succession est manifestement déficitaire (plus de dettes que de biens), la renonciation se fait par acte notarié ou par déclaration judiciaire. Attention : certains gestes (utiliser les biens, encaisser des sommes) peuvent valoir acceptation tacite.",
      delai: ech
        ? `Délai de réflexion de 6 mois : jusqu'au ${ech.option6mois}`
        : "Délai de réflexion : 6 mois à compter du décès",
      attention:
        "Ne touchez pas aux biens de la succession avant d'avoir pris votre décision — vous pourriez être réputé avoir accepté.",
      notaire: true,
    });
  }

  t2.push(
    {
      id: "rdprm",
      titre: "Inscrire la désignation du liquidateur au RDPRM",
      description:
        "L'inscription de la désignation au Registre des droits personnels et réels mobiliers informe les tiers de l'identité du liquidateur et le protège dans l'exercice de sa charge.",
      liens: [LIENS.soquij],
    },
    {
      id: "organismes",
      titre: "Aviser les organismes gouvernementaux",
      description:
        "Retraite Québec (rentes, prestation de décès du RRQ d'environ 2 500 $), Service Canada (pension de la Sécurité de la vieillesse, prestations), RAMQ, SAAQ (permis, immatriculation), Revenu Québec et ARC. Plusieurs prestations cessent au décès : les sommes versées en trop devront être remboursées.",
      delai: ech
        ? `Prestation de décès du RRQ : demande prioritaire du payeur des funérailles avant le ${ech.rrq60jours}`
        : "Prestation de décès du RRQ : demande dans les 60 jours pour le payeur des funérailles",
      liens: [LIENS.retraiteQc, LIENS.quebecDeces],
    },
    {
      id: "banques",
      titre: "Aviser les institutions financières et les assureurs",
      description:
        "Les comptes du défunt sont gelés dès l'avis de décès (sauf certaines sommes pour les funérailles et les besoins urgents de la famille). Réclamez les assurances vie : elles se versent généralement hors succession, directement au bénéficiaire désigné, et rapidement.",
    },
    {
      id: "abonnements",
      titre: "Annuler ou transférer les contrats et abonnements",
      description:
        "Téléphone, électricité (Hydro-Québec), assurances habitation et auto, cartes de crédit, abonnements. Maintenez les assurances sur les biens de la succession jusqu'au partage.",
    },
    {
      id: "dossier-notaire",
      titre: "Constituer et transmettre votre dossier au notaire",
      description:
        "Héritia rassemble pour vous toutes les informations dont le notaire a besoin — défunt, héritiers, biens, documents déjà en main — dans un document clair et structuré. Générez-le, puis transmettez-le à votre notaire : la première rencontre sera beaucoup plus courte et efficace. Le notaire vous demandera lui-même, de façon sécurisée, les renseignements sensibles comme le numéro d'assurance sociale.",
      action: "dossier",
    }
  );

  phases.push({
    id: "premieres-semaines",
    titre: "Premières semaines",
    sousTitre: "Testament, liquidateur et avis officiels",
    taches: t2,
  });

  // ───── Phase 3 : Liquidation ─────
  const t3 = [
    {
      id: "inventaire",
      titre: "Dresser l'inventaire des biens et des dettes",
      description:
        "Obligation légale du liquidateur (art. 794 C.c.Q.) : liste détaillée des actifs (comptes, placements, immeubles, véhicules, meubles de valeur) et des passifs (dettes, impôts, factures). L'inventaire se fait par acte notarié ou sous seing privé devant deux témoins.",
      attention:
        "Sans inventaire, les héritiers peuvent devenir personnellement responsables des dettes de la succession, même au-delà de la valeur des biens reçus.",
    },
    {
      id: "avis-cloture-inventaire",
      titre: "Publier l'avis de clôture d'inventaire",
      description:
        "L'avis se publie au RDPRM et dans un journal distribué dans la localité du défunt. Il indique où les héritiers et les créanciers peuvent consulter l'inventaire.",
      liens: [LIENS.soquij],
    },
  ];

  if (r.conjugal === "marie") {
    t3.push({
      id: "patrimoine-familial",
      titre: "Liquider le patrimoine familial et les droits matrimoniaux",
      description:
        "Avant de partager la succession, il faut d'abord régler les droits du conjoint survivant : partage du patrimoine familial (résidences, meubles, véhicules, droits accumulés dans les REER et régimes de retraite pendant le mariage), liquidation du régime matrimonial et, le cas échéant, prestation compensatoire. La succession se partage seulement sur ce qui reste. Un notaire est fortement recommandé pour ce calcul.",
      liens: [LIENS.educaloi],
    });
  }

  if (r.immeuble) {
    t3.push({
      id: "transmission-immeuble",
      titre: "Faire publier la déclaration de transmission immobilière",
      description:
        "Acte notarié obligatoire pour transférer l'immeuble aux héritiers ou permettre sa vente. Le notaire publie la déclaration au Registre foncier. Sans elle, l'immeuble reste juridiquement au nom du défunt. Pensez aussi à aviser l'assureur et la municipalité.",
      notaire: true,
    });
  }

  if (r.entreprise) {
    t3.push({
      id: "entreprise",
      titre: "Gérer les intérêts d'entreprise du défunt",
      description:
        "Entreprise individuelle, parts de société ou actions : vérifiez s'il existe une convention entre actionnaires avec clause de rachat ou d'assurance vie croisée. Mettez à jour le Registraire des entreprises. L'entreprise continue de vivre pendant la liquidation : consultez rapidement un comptable et un avocat ou notaire en droit des affaires.",
      attention:
        "Les délais d'affaires n'attendent pas la succession : paies, fournisseurs et contrats en cours doivent être gérés sans interruption.",
    });
  }

  if (r.reer) {
    t3.push({
      id: "reer",
      titre: "Traiter les REER, FERR et CELI",
      description:
        "Vérifiez les bénéficiaires désignés dans chaque régime. Un roulement fiscal au conjoint survivant (ou à un enfant mineur ou handicapé à charge) permet de transférer les REER et FERR sans impôt immédiat. Sinon, leur pleine valeur s'ajoute aux revenus de la déclaration finale — l'impact fiscal peut être considérable. Le CELI, lui, se transfère sans impôt mais cesse de croître à l'abri après le décès.",
      liens: [LIENS.arc, LIENS.revenuQc],
    });
  }

  if (r.mineurs) {
    t3.push({
      id: "mineurs",
      titre: "Protéger la part des héritiers mineurs",
      description:
        "Un mineur ne peut pas recevoir directement sa part : elle est administrée par son tuteur (généralement les parents). Le liquidateur doit aviser le Curateur public lorsque la valeur transmise à un mineur dépasse les seuils prévus; un conseil de tutelle et une sûreté peuvent être exigés. Vérifiez aussi si le testament prévoit une fiducie ou une administration prolongée.",
      liens: [LIENS.curateur],
    });
  }

  t3.push(
    {
      id: "signature-notaire",
      titre: "Signer les actes chez le notaire — en personne ou par vidéoconférence",
      description:
        "À partir de votre dossier, le notaire prépare les actes nécessaires (vérification de testament, déclaration de transmission, renonciation, inventaire notarié…) puis vous convoque pour la signature. Au Québec, l'acte notarié technologique permet de signer à distance : le notaire vérifie votre identité par vidéoconférence et vous signez électroniquement, sans vous déplacer. La signature à son étude reste toujours possible si vous préférez.",
    },
    {
      id: "impots",
      titre: "Produire les déclarations de revenus du défunt",
      description:
        "Déclaration finale au provincial (Revenu Québec) et au fédéral (ARC) pour l'année du décès, plus toute année antérieure manquante. Au décès, la loi présume que tous les biens sont vendus à leur juste valeur : un gain en capital latent (chalet, immeuble locatif, placements) peut générer un impôt important.",
      delai: ech
        ? `Date limite des déclarations finales : ${ech.impots}`
        : "Au plus tard le 30 avril de l'année suivante, ou 6 mois après le décès si celui-ci survient après le 31 octobre",
      liens: [LIENS.revenuQc, LIENS.arc],
    },
    {
      id: "certificats-fiscaux",
      titre: "Obtenir les certificats de décharge fiscale",
      description:
        "Avant de distribuer les biens : certificat autorisant la distribution de Revenu Québec (formulaire MR-14.A) et certificat de décharge de l'ARC (formulaire TX19). Les délais d'émission peuvent atteindre plusieurs mois.",
      attention:
        "Distribuer sans ces certificats rend le liquidateur PERSONNELLEMENT responsable des impôts impayés du défunt.",
      liens: [LIENS.revenuQc, LIENS.arc],
    },
    {
      id: "dettes",
      titre: "Payer les dettes et les legs particuliers",
      description:
        "Payez d'abord les créanciers, puis les legs particuliers, dans l'ordre prévu par la loi. Conservez une réserve pour les impôts tant que les certificats fiscaux ne sont pas émis.",
      attention:
        "Si la succession semble insolvable, ne payez rien sans conseil juridique : un ordre de priorité strict s'applique et le liquidateur peut engager sa responsabilité.",
    }
  );

  phases.push({
    id: "liquidation",
    titre: "Liquidation",
    sousTitre: "Inventaire, impôts et paiement des dettes",
    taches: t3,
  });

  // ───── Phase 4 : Clôture ─────
  phases.push({
    id: "cloture",
    titre: "Clôture",
    sousTitre: "Reddition de compte et partage",
    taches: [
      {
        id: "compte-definitif",
        titre: "Rendre compte aux héritiers",
        description:
          "Le compte définitif du liquidateur présente l'ensemble des opérations : sommes reçues, dettes payées, frais, et l'actif net à partager. Faites-le accepter par écrit par tous les héritiers.",
      },
      {
        id: "avis-cloture-compte",
        titre: "Publier l'avis de clôture du compte au RDPRM",
        description:
          "Cette publication marque officiellement la fin de la charge du liquidateur et le libère de ses obligations.",
        liens: [LIENS.soquij],
      },
      {
        id: "partage",
        titre: "Distribuer les biens aux héritiers",
        description:
          "Seulement après l'obtention des certificats fiscaux et l'acceptation du compte définitif. Faites signer une quittance à chaque héritier au moment de la remise de sa part.",
        attention:
          "C'est la dernière étape — pas la première. Une distribution prématurée est la source d'erreur la plus coûteuse pour un liquidateur.",
      },
    ],
  });

  return phases;
}
