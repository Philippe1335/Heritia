// Parcours de liquidation d'une succession au Québec.
// Le parcours est construit dynamiquement selon les réponses au questionnaire :
// { testament: "notarie" | "olographe" | "aucun", immeuble: bool, entreprise: bool,
//   role: "liquidateur" | "heritier" | "preparation" }
//
// Chaque tâche : { id, titre, description, delai?, attention?, notaire?, liens? }
// - delai : repère temporel ou échéance légale, affiché en badge
// - attention : mise en garde importante, affichée en encadré
// - notaire : true si l'acte exige légalement un notaire
// - liens : ressources officielles [{ label, url }]

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
    cle: "role",
    q: "Quel est votre rôle dans cette succession?",
    aide: "Votre parcours sera adapté : un héritier n'a pas les mêmes obligations qu'un liquidateur.",
    options: [
      { v: "liquidateur", l: "Je suis liquidateur (ou je le deviendrai)" },
      { v: "heritier", l: "Je suis héritier" },
      { v: "preparation", l: "Je m'informe à l'avance" },
    ],
  },
];

export const LIBELLES_REPONSES = {
  testament: {
    notarie: "Testament notarié",
    olographe: "Testament olographe ou devant témoins",
    aucun: "Sans testament connu",
  },
  immeuble: { true: "Avec immeuble", false: "Sans immeuble" },
  entreprise: { true: "Avec entreprise", false: "Sans entreprise" },
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
  rdprm: { label: "RDPRM", url: "https://www.rdprm.gouv.qc.ca/" },
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
};

export function buildParcours(r) {
  const estHeritier = r.role === "heritier";
  const phases = [];

  // ───── Phase 1 : Premiers jours ─────
  phases.push({
    id: "premiers-jours",
    titre: "Premiers jours",
    sousTitre: "Les démarches immédiates après le décès",
    taches: [
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
          "Testament, contrat de mariage, relevés bancaires, polices d'assurance, titres de propriété, déclarations de revenus des dernières années, factures courantes. Un dossier complet vous fera gagner des mois.",
      },
      {
        id: "proteger",
        titre: "Sécuriser les biens de la succession",
        description:
          "Résidence, véhicule, objets de valeur : assurez-vous qu'ils sont protégés et assurés. Le liquidateur doit agir avec prudence et diligence dès le décès, comme le ferait un administrateur du bien d'autrui.",
        attention:
          "Ne distribuez rien et ne videz pas la maison pour l'instant : l'inventaire doit d'abord être dressé.",
      },
    ],
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

  if (estHeritier) {
    t2.push({
      id: "option",
      titre: "Décider d'accepter ou de renoncer à la succession",
      description:
        "Comme héritier, vous avez le droit d'accepter ou de renoncer à la succession. Si la succession est manifestement déficitaire (plus de dettes que de biens), la renonciation se fait par acte notarié ou par déclaration judiciaire. Attention : certains gestes (utiliser les biens, encaisser des sommes) peuvent valoir acceptation tacite.",
      delai: "Délai de réflexion : 6 mois à compter du décès",
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
      delai: "Prestation de décès du RRQ : demande dans les 60 jours pour le payeur des funérailles",
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

  t3.push(
    {
      id: "impots",
      titre: "Produire les déclarations de revenus du défunt",
      description:
        "Déclaration finale au provincial (Revenu Québec) et au fédéral (ARC) pour l'année du décès, plus toute année antérieure manquante. Au décès, la loi présume que tous les biens sont vendus à leur juste valeur : un gain en capital latent (chalet, immeuble locatif, placements) peut générer un impôt important.",
      delai:
        "Au plus tard le 30 avril de l'année suivante, ou 6 mois après le décès si celui-ci survient après le 31 octobre",
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
