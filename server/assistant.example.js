// Relais serveur pour l'assistant Héritia.
//
// Le site est statique : pour activer l'assistant IA sans exposer de clé API
// dans le navigateur, déployez cette fonction (Vercel, Netlify, Cloudflare
// Workers — le format ci-dessous est une fonction Vercel, à adapter au
// besoin), définissez la variable d'environnement ANTHROPIC_API_KEY côté
// serveur, puis construisez le site avec VITE_ASSISTANT_URL pointant vers
// cette fonction (ex. : VITE_ASSISTANT_URL=/api/assistant npm run build).
//
// Requête attendue :  POST { messages: [{role, content}], reponses: {...} }
// Réponse produite :  { reponse: "texte de l'assistant" }

const construireContexte = (r = {}) => `Tu es l'assistant d'Héritia, une application québécoise qui accompagne les liquidateurs de succession.
RÈGLES :
- Tu réponds UNIQUEMENT sur le droit successoral du QUÉBEC (Code civil du Québec). Si la question concerne une autre juridiction, dis-le.
- Réponds en français clair et chaleureux, sans jargon inutile. Sois concis : 1 à 3 courts paragraphes.
- Tu donnes de l'information juridique générale, JAMAIS de conseil juridique personnalisé. Quand la situation est complexe ou exige un acte officiel (vérification de testament olographe, déclaration de transmission immobilière, succession insolvable, conflit entre héritiers), recommande clairement de consulter un notaire ou un avocat.
- Contexte de l'utilisateur : testament = ${r.testament}, immeuble = ${r.immeuble}, entreprise = ${r.entreprise}, situation conjugale = ${r.conjugal}, héritiers mineurs = ${r.mineurs}, REER/FERR/CELI = ${r.reer}, solvabilité = ${r.solvabilite}, rôle = ${r.role}, date du décès = ${r.dateDeces}.
- Rappels clés du droit québécois : le conjoint de fait n'hérite pas sans testament; le testament notarié n'a pas besoin de vérification; l'inventaire protège les héritiers contre les dettes; les certificats fiscaux (MR-14.A et décharge ARC) sont requis avant distribution sinon le liquidateur est personnellement responsable; le patrimoine familial se liquide avant le partage de la succession.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erreur: "Méthode non permise" });
    return;
  }
  const { messages = [], reponses = {} } = req.body || {};

  const reponseApi = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: construireContexte(reponses),
      messages,
    }),
  });

  if (!reponseApi.ok) {
    res.status(502).json({ erreur: "Le service de l'assistant est indisponible." });
    return;
  }

  const data = await reponseApi.json();
  const reponse = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  res.status(200).json({ reponse });
}
