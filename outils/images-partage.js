// Fabrique les images de partage (format Pinterest 1000 × 1500) de chaque fiche, dans chaque langue.
// À lancer sur un ordinateur avec Playwright : node outils/images-partage.js  →  écrit dans og/{langue}/{id}.jpg
// Les images sont ensuite copiées telles quelles dans le site par build.js.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const ROOT = path.join(__dirname, "..");
const LANGS = (process.env.OG_LANGS || "fr,en,de,it,es").split(",");
const PIED = { fr: "Tuto gratuit pas à pas", en: "Free step-by-step guide", de: "Gratis-Anleitung", it: "Tutorial gratuito passo passo", es: "Tutorial gratis paso a paso" };
(async () => {
  const only = process.argv[2]; // facultatif : un seul id
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const lang of LANGS) {
    await p.goto("file://" + path.join(ROOT, "src", "app.html"));
    await p.evaluate(l => { localStorage.setItem("lang", JSON.stringify(l)); }, lang);
    await p.reload();
    await p.waitForFunction(() => document.fonts && document.fonts.status === "loaded");
    await p.evaluate(() => document.fonts.load('800 80px "Baloo 2"'));
    await p.addStyleTag({ content: "body::before{display:none!important} body{margin:0}" });
    const ids = await p.evaluate(() => ACTIVITIES.map(a => a.id));
    fs.mkdirSync(path.join(ROOT, "og", lang), { recursive: true });
    for (const id of ids) {
      if (only && id !== only) continue;
      await p.evaluate(({ id, pied }) => {
        const a = L(ACTIVITIES.find(x => x.id === id)), m = meta(a);
        document.body.innerHTML = `<div id="og" style="width:1000px;height:1500px;box-sizing:border-box;padding:60px;background:color-mix(in srgb, ${a.couleur} 22%, #FFF8EC);font-family:Nunito,sans-serif;color:#23264B;display:flex;flex-direction:column;gap:34px;position:relative;overflow:hidden">
          <div style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:14px;font:800 52px 'Baloo 2',sans-serif">${mascotSVG("m").replace("<svg", '<svg width="70" height="70"')}Fabrikolo</div>
          <span style="font:800 30px Nunito;background:#fff;border:4px solid #23264B;border-radius:999px;padding:10px 26px;box-shadow:6px 6px 0 #23264B">${t("Dès {n} ans", { n: a.ageMin })}</span></div>
          <div style="flex:1;background:#fff;border:6px solid #23264B;border-radius:48px;box-shadow:14px 14px 0 #23264B;display:grid;place-items:center;padding:40px">${ART[id]().replace("<svg", '<svg width="640" height="640"')}</div>
          <h1 style="margin:0;font:800 88px/1 'Baloo 2',sans-serif;letter-spacing:-1px">${a.titre}</h1>
          <div style="display:flex;gap:18px;flex-wrap:wrap;font:800 32px Nunito">
            <span style="background:#fff;border:4px solid #23264B;border-radius:999px;padding:10px 24px">⏱ ${t(a.faits[1][1])}</span>
            <span style="background:#fff;border:4px solid #23264B;border-radius:999px;padding:10px 24px">${"●".repeat(m.niveau)}${"○".repeat(3 - m.niveau)} ${t(NIVEAUX[m.niveau])}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#23264B;color:#fff;border-radius:28px;padding:24px 34px;font:800 34px Nunito"><span>${pied}</span><span style="color:#FFC23D">fabrikolo.pages.dev</span></div>
        </div>`;
      }, { id, pied: PIED[lang] });
      const el = await p.$("#og");
      await el.screenshot({ path: path.join(ROOT, "og", lang, id + ".jpg"), type: "jpeg", quality: 82 });
    }
    // Image de l'accueil : quatre dessins et la promesse du site
    if (!only || only === "accueil") {
      await p.evaluate(({ pied }) => {
        const ids = ["fantome-sequins", "volcan", "lapin-rouleau", "flocons-papier"];
        document.body.innerHTML = `<div id="og" style="width:1000px;height:1500px;box-sizing:border-box;padding:60px;background:#FFF1DA;font-family:Nunito,sans-serif;color:#23264B;display:flex;flex-direction:column;gap:36px">
          <div style="display:flex;align-items:center;gap:18px;font:800 70px 'Baloo 2',sans-serif">${mascotSVG("m").replace("<svg", '<svg width="100" height="100"')}Fabrikolo</div>
          <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:28px">${ids.map(id => `<div style="background:#fff;border:6px solid #23264B;border-radius:40px;box-shadow:10px 10px 0 #23264B;display:grid;place-items:center">${ART[id]().replace("<svg", '<svg width="330" height="330"')}</div>`).join("")}</div>
          <h1 style="margin:0;font:800 84px/1.02 'Baloo 2',sans-serif">${t("Qu'est-ce qu'on {fabrique} aujourd'hui ?").replace(/[{}]/g, "")}</h1>
          <p style="margin:0;font:800 38px/1.3 Nunito">${t("Voir les {n} activités", { n: ACTIVITIES.length })} · ${t("Matériel de placard")}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#23264B;color:#fff;border-radius:28px;padding:24px 34px;font:800 34px Nunito"><span>${pied}</span><span style="color:#FFC23D">fabrikolo.pages.dev</span></div>
        </div>`;
      }, { pied: PIED[lang] });
      await (await p.$("#og")).screenshot({ path: path.join(ROOT, "og", lang, "accueil.jpg"), type: "jpeg", quality: 82 });
    }
    console.log(lang, "ok");
  }
  await b.close();
})();
