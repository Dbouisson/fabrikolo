// Signale toutes les pages du site à Bing et aux moteurs IndexNow : node outils/indexnow.js
const fs = require("fs"), path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf8"));
const base = cfg.domaine.replace(/\/$/, ""), host = new URL(base).host;
(async () => {
  const xml = await fetch(base + "/sitemap.xml").then(r => r.text());
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const r = await fetch("https://www.bing.com/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: cfg.indexNowKey, keyLocation: `${base}/${cfg.indexNowKey}.txt`, urlList: urls }) });
  console.log(urls.length, "pages signalées → réponse", r.status);
})();
