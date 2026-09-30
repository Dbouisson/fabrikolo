// Construit la version publique de Fabrikolo dans le dossier dist/.
// Usage : node build.js
// Une page par activité (bonne adresse pour Google), plan du site, mentions légales.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
const app = fs.readFileSync(path.join(ROOT, "src", "app.html"), "utf8");
const DIST = path.join(ROOT, "dist");
const base = cfg.domaine.replace(/\/$/, "");

// Récupère le tableau ACTIVITIES (données seules) pour les titres et descriptions.
const m = app.match(/const ACTIVITIES = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error("Tableau ACTIVITIES introuvable dans src/app.html");
const ACTIVITIES = vm.runInNewContext(m[1]);

// Traductions des fiches (TRAD + ajouts Object.assign(TRAD.xx, …))
const ti = app.indexOf("const TRAD = {");
const tEnd = app.lastIndexOf("Object.assign(TRAD.");
const tStop = app.indexOf("\n});\n", tEnd) + 5;
const TRAD = vm.runInNewContext(app.slice(ti, tStop).replace("const TRAD =", "var TRAD =") + "\nTRAD;");
const LANGS = ["fr", "en", "de", "it", "es"];
const OG = { fr: "fr_FR", en: "en_GB", de: "de_DE", it: "it_IT", es: "es_ES" };
const TXT = {
  fr: { home: "activités créatives pour enfants", desc: cfg.description, act: (t, n) => `${t} : activité enfant dès ${n} ans`, more: "Matériel, étapes pas à pas et astuces si ça rate.", nf: "Page introuvable" },
  en: { home: "creative activities for kids", desc: "Crafts, science experiments and seasonal activities for kids, with step-by-step instructions, materials lists and tips when things go wrong.", act: (t, n) => `${t}: kids' activity, age ${n}+`, more: "Materials, step-by-step instructions and troubleshooting tips.", nf: "Page not found" },
  de: { home: "kreative Aktivitäten für Kinder", desc: "Basteln, Experimente und Ideen für jede Jahreszeit, mit Schritt-für-Schritt-Anleitungen, Materiallisten und Tipps, wenn etwas schiefgeht.", act: (t, n) => `${t}: Kinderaktivität ab ${n} Jahren`, more: "Material, Schritt-für-Schritt-Anleitung und Tipps, wenn es nicht klappt.", nf: "Seite nicht gefunden" },
  it: { home: "attività creative per bambini", desc: "Lavoretti, esperimenti e idee per ogni stagione, con istruzioni passo passo, elenco dei materiali e consigli se qualcosa va storto.", act: (t, n) => `${t}: attività per bambini dai ${n} anni`, more: "Materiali, istruzioni passo passo e consigli se qualcosa non va.", nf: "Pagina non trovata" },
  es: { home: "actividades creativas para niños", desc: "Manualidades, experimentos e ideas para cada estación, con instrucciones paso a paso, lista de materiales y trucos si algo sale mal.", act: (t, n) => `${t}: actividad infantil desde ${n} años`, more: "Materiales, instrucciones paso a paso y trucos si algo falla.", nf: "Página no encontrada" }
};
const pre = l => (l === "fr" ? "" : "/" + l);
const tr = (l, a) => (l === "fr" ? a : Object.assign({}, a, (TRAD[l] || {})[a.id] || {}));

// Le code et le style sont partagés par toutes les pages (app.js, app.css) :
// le navigateur les garde en cache et le site reste léger.
const JS = app.match(/<script>([\s\S]*)<\/script>/)[1];
const CSS = app.match(/<style>([\s\S]*?)<\/style>/)[1];
const VER = require("crypto").createHash("sha1").update(JS + CSS).digest("hex").slice(0, 8);
const body = app.replace(/<title>[\s\S]*?<\/title>\s*/, "")
  .replace(/<style>[\s\S]*?<\/style>/, () => `<link rel="stylesheet" href="/app.css?v=${VER}">`)
  .replace(/<script>[\s\S]*<\/script>/, () => `<script src="/app.js?v=${VER}"></script>`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const analytics = cfg.cloudflareAnalyticsToken
  ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(cfg.cloudflareAnalyticsToken)}"}'></script>`
  : "";

function page({ title, description, url, start, lang = "fr", alt = "", image = "", statique = "", ld = null }) {
  const site = { lang, newsletterAction: cfg.newsletterAction || "", contributionFormUrl: cfg.contributionFormUrl || "", galerie: cfg.galerie || [], concours: cfg.concours || null, codeDore: cfg.codeDore || "", start: start || "" };
  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${cfg.googleVerification ? `<meta name="google-site-verification" content="${esc(cfg.googleVerification)}">` : ""}
<link rel="canonical" href="${esc(url)}">
${alt}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.nomSite)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:locale" content="${OG[lang]}">
${image ? `<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1000">
<meta property="og:image:height" content="1500">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(image)}">
<meta name="pinterest-rich-pin" content="true">` : ""}
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>` : ""}
<style>html{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
<script>window.SITE=${JSON.stringify(site)};</script>
${analytics}
</head><body>
${statique ? body.replace('<div class="wrap" id="app"></div>', `<div class="wrap" id="app">${statique}</div>`) : body}
</body></html>
`;
}

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

fs.rmSync(DIST, { recursive: true, force: true });
write("app.js", JS);
write("app.css", CSS);

// Liens hreflang : chaque page annonce ses versions dans les autres langues
const alternates = rel => LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${base}${pre(l)}${rel}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${base}${rel}">\n`;

write("404.html", page({ title: `${TXT.fr.nf} · ${cfg.nomSite}`, description: cfg.description, url: `${base}/` }));
// Texte des pages visible sans JavaScript : Google, Pinterest et les aperçus de liens le lisent directement.
// L'application le remplace par la version interactive dès qu'elle démarre.
const LAB = {
  fr: { mat: "Matériel", etapes: "Étapes", rate: "Si ça rate", secu: "Sécurité", sources: "Sources", toutes: "Toutes les activités", age: "Âge" },
  en: { mat: "Materials", etapes: "Steps", rate: "If it goes wrong", secu: "Safety", sources: "Sources", toutes: "All activities", age: "Age" },
  de: { mat: "Material", etapes: "Schritte", rate: "Wenn es nicht klappt", secu: "Sicherheit", sources: "Quellen", toutes: "Alle Aktivitäten", age: "Alter" },
  it: { mat: "Materiale", etapes: "Passaggi", rate: "Se qualcosa va storto", secu: "Sicurezza", sources: "Fonti", toutes: "Tutte le attività", age: "Età" },
  es: { mat: "Materiales", etapes: "Pasos", rate: "Si algo sale mal", secu: "Seguridad", sources: "Fuentes", toutes: "Todas las actividades", age: "Edad" }
};
const imageDe = (l, id) => `${base}/og/${l}/${id}.jpg`;
function ficheStatique(l, a) {
  const B = LAB[l];
  return `<article class="statique"><h1>${esc(a.titre)}</h1><p>${esc(a.accroche)}</p><p><strong>${B.age} :</strong> ${esc(a.age || "")}</p>
<h2>${B.mat}</h2><ul>${(a.materiel || []).map(m => `<li>${esc(m[0])}${m[1] ? " : " + esc(m[1]) : ""}</li>`).join("")}</ul>
<h2>${B.etapes}</h2>${(a.seances || []).map(se => `<h3>${esc(se.titre)}</h3><ol>${se.etapes.map(e => `<li>${esc(e)}</li>`).join("")}</ol>`).join("")}
${a.science ? `<p>${esc(a.science)}</p>` : ""}${a.variante ? `<p>${esc(a.variante)}</p>` : ""}
${(a.depannage || []).length ? `<h2>${B.rate}</h2><ul>${a.depannage.map(d => `<li>${esc(d[0])} : ${esc(d[2])}</li>`).join("")}</ul>` : ""}
${(a.securite || []).length ? `<h2>${B.secu}</h2><ul>${a.securite.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<h2>${B.sources}</h2><ul>${(a.sources || []).map(x => `<li><a href="${esc(x[1])}" rel="noopener">${esc(x[0])}</a></li>`).join("")}</ul>
<p><a href="${pre(l)}/">${B.toutes}</a></p></article>`;
}
function accueilStatique(l, T) {
  return `<section class="statique"><h1>${esc(cfg.nomSite)} : ${esc(T.home)}</h1><p>${esc(T.desc)}</p><ul>${ACTIVITIES.map(a0 => { const a = tr(l, a0); return `<li><a href="${pre(l)}/activites/${a.id}/">${esc(a.titre)}</a> : ${esc(a.accroche)}</li>`; }).join("")}</ul></section>`;
}
function ldFiche(l, a, url) {
  return { "@context": "https://schema.org", "@type": "HowTo", name: a.titre, description: a.accroche, image: imageDe(l, a.id), inLanguage: l, url,
    supply: (a.materiel || []).map(m => ({ "@type": "HowToSupply", name: m[0] })),
    step: (a.seances || []).flatMap(se => se.etapes).map((e, i) => ({ "@type": "HowToStep", position: i + 1, text: e })),
    publisher: { "@type": "Organization", name: cfg.nomSite, url: base + "/" } };
}
// Images de partage : fabriquées par outils/images-partage.js dans og/, copiées telles quelles
const OG_SRC = path.join(ROOT, "og");
if (fs.existsSync(OG_SRC)) for (const l of fs.readdirSync(OG_SRC)) for (const f of fs.readdirSync(path.join(OG_SRC, l))) write(`og/${l}/${f}`, fs.readFileSync(path.join(OG_SRC, l, f)));
const aImage = (l, id) => fs.existsSync(path.join(OG_SRC, l, id + ".jpg")) ? imageDe(l, id) : "";

for (const l of LANGS) {
  const T = TXT[l], P = pre(l);
  // Accueil
  write(`${P.slice(1)}${P ? "/" : ""}index.html`, page({ lang: l, title: `${cfg.nomSite} : ${T.home}`, description: T.desc, url: `${base}${P}/`, alt: alternates("/"), image: aImage(l, "accueil"), statique: accueilStatique(l, T) }));
  // Une page par activité
  for (const a0 of ACTIVITIES) {
    const a = tr(l, a0);
    write(`${P.slice(1)}${P ? "/" : ""}activites/${a.id}/index.html`, page({
      lang: l,
      title: `${T.act(a.titre, a.ageMin)} · ${cfg.nomSite}`,
      description: `${a.accroche} ${T.more}`,
      url: `${base}${P}/activites/${a.id}/`,
      start: a.id,
      alt: alternates(`/activites/${a.id}/`),
      image: aImage(l, a.id),
      statique: ficheStatique(l, a),
      ld: ldFiche(l, a, `${base}${P}/activites/${a.id}/`)
    }));
  }
}

// Mentions légales et confidentialité
const legal = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mentions légales · ${esc(cfg.nomSite)}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=Nunito:wght@400;800&display=swap">
<style>body{margin:0;background:#DDF0FF;color:#23264B;font:17px/1.6 Nunito,system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:24px 16px 64px}h1,h2{font-family:"Baloo 2",system-ui,sans-serif;line-height:1.1}section{background:#fff;border:3px solid #23264B;border-radius:22px;padding:4px 20px 14px;margin-block:16px}a{color:#3E7BFA;font-weight:800}</style>
</head><body><main>
<p><a href="/">← Retour à l'atelier</a></p>
<h1>Mentions légales et confidentialité</h1>
<section><h2>Éditeur</h2><p>${esc(cfg.editeur.nom)}<br>Contact : ${esc(cfg.editeur.contact)}</p></section>
<section><h2>Hébergement</h2><p>${esc(cfg.hebergeur.nom)}, ${esc(cfg.hebergeur.adresse)} (<a href="${esc(cfg.hebergeur.site)}">${esc(cfg.hebergeur.site)}</a>).</p></section>
<section><h2>Contenus</h2><p>Les fiches sont rédigées par l'éditeur, à partir d'idées vues sur les réseaux sociaux et recoupées avec d'autres tutoriels, cités en source sur chaque fiche. Les illustrations sont originales.</p></section>
<section><h2>Données et cookies</h2>
<p>Le site ne dépose pas de cookie publicitaire.</p>
<p>Les cases cochées, le suivi du séchage et le carnet de tampons sont enregistrés uniquement dans le navigateur du visiteur (stockage local), jamais envoyés ailleurs. Ils s'effacent en vidant les données du site.</p>
${cfg.cloudflareAnalyticsToken ? "<p>La fréquentation est mesurée avec Cloudflare Web Analytics, sans cookie et sans suivi individuel.</p>" : ""}
${cfg.newsletterAction ? "<p>L'adresse e-mail donnée pour la newsletter sert uniquement à l'envoi de la newsletter du lundi. Elle est enregistrée chez Brevo (Sendinblue SAS, France), le service d'envoi utilisé par le site, après confirmation par e-mail (double inscription). Chaque envoi contient un lien de désinscription. Pour faire supprimer votre adresse, écrivez à l'adresse de contact ci-dessus.</p>" : ""}
</section>
${cfg.affiliationActive ? `<section><h2>Liens affiliés</h2><p>Certains liens vers du matériel sont des liens affiliés : l'éditeur touche une petite commission sur les achats, sans aucun surcoût pour vous. En tant que Partenaire Amazon, l'éditeur réalise un bénéfice sur les achats remplissant les conditions requises.</p></section>` : ""}
</main></body></html>
`;
write("mentions-legales/index.html", legal);

// Photos de la galerie : copiées depuis le dossier galerie/ du projet
const GAL_SRC = path.join(ROOT, "galerie");
if (fs.existsSync(GAL_SRC)) {
  for (const f of fs.readdirSync(GAL_SRC)) {
    if (/\.(jpe?g|png|webp)$/i.test(f)) write(`galerie/${f}`, fs.readFileSync(path.join(GAL_SRC, f)));
  }
}

// Page « Participer » : règles d'envoi des photos, autorisation d'utilisation, règlement du concours
const k = cfg.concours || {};
const participer = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Participer · ${esc(cfg.nomSite)}</title>
<meta name="description" content="Envoie la photo de ta réalisation et participe au coup de cœur du mois de ${esc(cfg.nomSite)}.">
<link rel="canonical" href="${base}/participer/">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=Nunito:wght@400;800&display=swap">
<style>body{margin:0;background:#DDF0FF;color:#23264B;font:17px/1.6 Nunito,system-ui,sans-serif}main{max-width:760px;margin:0 auto;padding:24px 16px 64px}h1,h2{font-family:"Baloo 2",system-ui,sans-serif;line-height:1.1}section{background:#fff;border:3px solid #23264B;border-radius:22px;padding:4px 20px 14px;margin-block:16px}a{color:#3E7BFA;font-weight:800}.btn{display:inline-block;background:#3E7BFA;color:#fff;border:3px solid #23264B;border-radius:999px;padding:10px 20px;text-decoration:none;box-shadow:4px 4px 0 #23264B;font-family:"Baloo 2",system-ui,sans-serif}li{margin-block:4px}</style>
${analytics}
</head><body><main>
<p><a href="/">← Retour à l'atelier</a></p>
<h1>Montre ta réalisation</h1>
<p>Tu as fait une activité de l'atelier ? Envoie une photo de ton objet : tu reçois un code magique pour gagner le <strong>tampon doré ✨</strong>, les plus belles photos rejoignent la galerie, et chaque mois un coup de cœur est mis à l'honneur.</p>
<p>${cfg.contributionFormUrl ? `<a class="btn" href="${esc(cfg.contributionFormUrl)}" target="_blank" rel="noopener">📸 Envoyer ma photo</a>` : "<strong>L'envoi des photos ouvre très bientôt.</strong>"}</p>

<section><h2>Les règles de la galerie</h2>
<ul>
<li>La photo est envoyée par un adulte : le parent ou le représentant légal de l'enfant.</li>
<li><strong>On montre l'objet, pas l'enfant</strong> : aucun visage, aucune personne reconnaissable. Une main qui tient l'objet, c'est d'accord.</li>
<li>Seuls le prénom de l'enfant et son âge peuvent être affichés, et seulement si vous le souhaitez. Jamais de nom de famille, d'école ni de ville.</li>
<li>Toutes les photos sont vérifiées avant publication. Une photo peut être refusée sans justification.</li>
</ul></section>

<section><h2>Autorisation d'utilisation de la photo</h2>
<p>En envoyant une photo, la personne qui l'envoie :</p>
<ul>
<li>déclare en être l'auteur, ou avoir l'accord de son auteur, et être le parent ou le représentant légal de l'enfant qui a réalisé l'objet ;</li>
<li>déclare qu'aucune personne n'est reconnaissable sur la photo ;</li>
<li>autorise ${esc(cfg.nomSite)} (${esc(cfg.editeur.nom)}), à titre gratuit et non exclusif, à reproduire et diffuser cette photo, éventuellement recadrée, redimensionnée ou légèrement retouchée (luminosité, couleurs), accompagnée du prénom et de l'âge indiqués ;</li>
<li>pour les usages suivants : le site ${esc(base)}, la newsletter du site, et les comptes de réseaux sociaux du site, pour illustrer les activités, la galerie et le concours ;</li>
<li>pour le monde entier, pendant 5 ans à compter de l'envoi.</li>
</ul>
<p>L'auteur conserve ses droits sur la photo et peut continuer à l'utiliser librement. Le retrait peut être demandé à tout moment en écrivant à ${esc(cfg.editeur.contact)} : la photo est alors retirée du site sous 7 jours.</p>
<p>Les données envoyées avec la photo (adresse e-mail, prénom, âge) servent uniquement à gérer la galerie, le tampon doré et le concours, ne sont jamais transmises à des tiers, et sont supprimées au plus tard 12 mois après la fin du concours. L'adresse e-mail n'est ajoutée à la newsletter du lundi que si la case correspondante a été cochée, et chaque envoi permet de se désinscrire. Vous pouvez accéder à vos données, les corriger ou les faire supprimer en écrivant à la même adresse.</p></section>

<section><h2>Règlement du concours « ${esc(k.titre || "Coup de cœur du mois")} »</h2>
<ol>
<li><strong>Organisateur</strong> : ${esc(cfg.editeur.nom)}, éditeur du site ${esc(base)}, contact : ${esc(cfg.editeur.contact)}.</li>
<li><strong>Dates</strong> : du ${esc(k.dateDebut || "À COMPLÉTER")} au ${esc(k.dateFin || "À COMPLÉTER")}.</li>
<li><strong>Participation gratuite et sans obligation d'achat.</strong> Elle se fait en envoyant la photo d'une réalisation inspirée d'une activité du site, par le formulaire de cette page, dans le respect des règles de la galerie.</li>
<li><strong>Qui peut participer</strong> : les enfants, par l'intermédiaire de leur parent ou représentant légal résidant en France, qui envoie la photo et accepte ce règlement. Une participation par enfant et par mois.</li>
<li><strong>Désignation du gagnant</strong> : un jury composé de l'organisateur choisit la réalisation la plus soignée ou la plus originale. Il n'y a pas de tirage au sort. Le choix du jury est sans appel.</li>
<li><strong>Lot</strong> : ${esc(k.lot || "À COMPLÉTER")} Valeur commerciale : 0 €. Le lot ne peut pas être échangé contre de l'argent.</li>
<li><strong>Annonce</strong> : le gagnant est annoncé sur le site et dans la newsletter dans les 7 jours suivant la fin du concours, par son seul prénom. Le parent est prévenu par e-mail.</li>
<li><strong>Données personnelles</strong> : voir le paragraphe « Autorisation d'utilisation de la photo » ci-dessus.</li>
<li><strong>Acceptation</strong> : participer vaut acceptation de ce règlement. L'organisateur peut écourter, prolonger ou annuler le concours si les circonstances l'exigent, en le signalant sur cette page.</li>
</ol></section>
<p><a href="/mentions-legales/">Mentions légales et confidentialité</a></p>
</main></body></html>
`;
write("participer/index.html", participer);

// Plan du site et robots
const today = new Date().toISOString().slice(0, 10);
const urls = [`${base}/participer/`, ...LANGS.flatMap(l => [`${base}${pre(l)}/`, ...ACTIVITIES.map(a => `${base}${pre(l)}/activites/${a.id}/`)])];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
// Clé IndexNow (Bing, Yandex, Seznam…) : prouve que les signalements de pages viennent bien du site
if (cfg.indexNowKey) write(`${cfg.indexNowKey}.txt`, cfg.indexNowKey);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

console.log(`OK : ${ACTIVITIES.length} activités × ${LANGS.length} langues, ${urls.length} pages dans le plan du site, sortie dans dist/`);
