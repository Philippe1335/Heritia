import { useEffect, useRef, useState } from "react";

// L'assistant n'est actif que si un relais serveur est configuré
// (VITE_ASSISTANT_URL au moment du build). La clé API ne vit jamais dans le
// navigateur : voir server/assistant.example.js pour le relais à déployer.
export const URL_ASSISTANT = import.meta.env.VITE_ASSISTANT_URL || "";

const MESSAGE_BIENVENUE = {
  role: "assistant",
  content:
    "Bonjour. Je suis l'assistant Héritia. Posez-moi vos questions sur la liquidation de la succession — délais, documents, rôle du liquidateur, impôts. Je vous explique en français clair, et je vous dirai franchement quand une étape exige un notaire ou un avocat.",
};

export default function Assistant({ reponses, onClose }) {
  const [messages, setMessages] = useState([MESSAGE_BIENVENUE]);
  const [texte, setTexte] = useState("");
  const [charge, setCharge] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const envoyer = async () => {
    if (!texte.trim() || charge) return;
    const nouveaux = [...messages, { role: "user", content: texte.trim() }];
    setMessages(nouveaux);
    setTexte("");
    setCharge(true);
    try {
      const res = await fetch(URL_ASSISTANT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nouveaux.slice(1).map((m) => ({ role: m.role, content: m.content })),
          reponses,
        }),
      });
      if (!res.ok) throw new Error(`relais : ${res.status}`);
      const data = await res.json();
      setMessages([
        ...nouveaux,
        {
          role: "assistant",
          content: data.reponse || "Désolé, je n'ai pas pu générer de réponse. Réessayez.",
        },
      ]);
    } catch {
      setMessages([
        ...nouveaux,
        {
          role: "assistant",
          content: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
        },
      ]);
    }
    setCharge(false);
  };

  return (
    <div className="voile" onClick={onClose}>
      <div
        className="panneau"
        role="dialog"
        aria-label="Assistant Héritia"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panneau-entete">
          <span>Assistant Héritia</span>
          <button className="btn-fermer" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="fil">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "bulle-user" : "bulle-ia"}>
              {m.content}
            </div>
          ))}
          {charge && <div className="bulle-ia">…</div>}
          <div ref={finRef} />
        </div>
        <div className="saisie">
          <input
            className="saisie-input"
            value={texte}
            placeholder="Ex. : Dois-je payer les dettes avant de distribuer?"
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && envoyer()}
          />
          <button className="btn-or btn-envoyer" onClick={envoyer} disabled={charge}>
            Envoyer
          </button>
        </div>
        <div className="mini-disclaimer">
          Information générale — ne remplace pas un conseil juridique.
        </div>
      </div>
    </div>
  );
}
