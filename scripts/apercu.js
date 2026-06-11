// Génère heritia-apercu.html : le site complet dans un seul fichier HTML
// autonome (CSS et JS intégrés), qu'on peut ouvrir directement sans serveur.
// La page d'accueil est pré-rendue dans le HTML pour rester visible même
// dans les visionneuses qui n'exécutent pas le JavaScript.
// Exécution : npm run apercu (lancé via vite-node pour pouvoir importer l'app)
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "../src/App.jsx";

// NODE_ENV=production explicite : vite-node tourne en development et le
// build hériterait sinon d'un React non minifié deux fois plus lourd
execSync("vite build --base=./", {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

let html = readFileSync("dist/index.html", "utf8");
const js = readFileSync("dist/" + html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1], "utf8");
const css = readFileSync("dist/" + html.match(/href="\.\/(assets\/[^"]+\.css)"/)[1], "utf8");
const accueil = renderToString(createElement(App));

// Fonctions de remplacement obligatoires : le code minifié contient des
// séquences ($&, $`) que String.replace interpréterait et corromprait.
html = html.replace(/<script type="module"[^>]*><\/script>/, () => "");
html = html.replace(/<link rel="stylesheet"[^>]*assets[^>]*>/, () => `<style>${css}</style>`);
html = html.replace('<div id="root"></div>', () => `<div id="root">${accueil}</div>`);
html = html.replace("</body>", () => `<script>(function(){${js}\n})()</script></body>`);

writeFileSync("heritia-apercu.html", html);
console.log(`heritia-apercu.html généré (${(html.length / 1024).toFixed(0)} Ko)`);
