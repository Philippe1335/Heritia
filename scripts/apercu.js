// Génère heritia-apercu.html : le site complet dans un seul fichier HTML
// autonome (CSS et JS intégrés), qu'on peut ouvrir directement sans serveur.
// Exécution : npm run apercu
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

execSync("vite build --base=./", { stdio: "inherit" });

let html = readFileSync("dist/index.html", "utf8");
const js = readFileSync("dist/" + html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1], "utf8");
const css = readFileSync("dist/" + html.match(/href="\.\/(assets\/[^"]+\.css)"/)[1], "utf8");

// Fonctions de remplacement obligatoires : le code minifié contient des
// séquences ($&, $`) que String.replace interpréterait et corromprait.
html = html.replace(/<script type="module"[^>]*><\/script>/, () => "");
html = html.replace(/<link rel="stylesheet"[^>]*assets[^>]*>/, () => `<style>${css}</style>`);
html = html.replace("</body>", () => `<script>(function(){${js}\n})()</script></body>`);

writeFileSync("heritia-apercu.html", html);
console.log(`heritia-apercu.html généré (${(html.length / 1024).toFixed(0)} Ko)`);
