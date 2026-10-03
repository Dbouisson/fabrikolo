// Réel « Les nouveautés de la semaine » (1080 × 1920, 15 s). node outils/reel-nouveautes.js
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), { execSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "reel"), FR = path.join(OUT, "frames3");
const FPS = 30, DUREE = 15;
const IDS = ["main-zombie", "fantomes-fenetre", "fantomes-spirale"];
(async () => {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(ROOT, "src", "app.html"));
  await p.evaluate(() => localStorage.setItem("lang", JSON.stringify("fr")));
  await p.reload();
  await p.waitForFunction(() => document.fonts.status === "loaded");
  await p.evaluate(() => Promise.all(['800 90px "Baloo 2"', '800 40px Nunito'].map(f => document.fonts.load(f))));
  await p.addStyleTag({ content: `body::before{display:none!important} html,body{margin:0;background:#1E1B33;overflow:hidden}
    #s{position:fixed;inset:0;width:1080px;height:1920px;font-family:Nunito,sans-serif;color:#FFF3E0;overflow:hidden;background:radial-gradient(circle at 50% 30%,#2D2850,#15132A)}
    .sc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center;padding:0 80px}
    .big{font:800 128px/1.02 "Baloo 2",sans-serif;letter-spacing:-2px}
    .mid{font:800 76px/1.1 "Baloo 2",sans-serif}
    .pill{font:800 44px Nunito;background:#FF8A1F;color:#1E1B33;border-radius:999px;padding:14px 38px}
    .card{width:820px;background:#fff;border:10px solid #FFF3E0;border-radius:64px;display:grid;place-items:center;padding:50px 0;box-shadow:0 30px 80px rgba(0,0,0,.45)}
    .chk{font:800 64px Nunito;display:flex;gap:26px;align-items:center}
    .chk b{display:grid;place-items:center;width:84px;height:84px;border-radius:50%;background:#2FB373;color:#fff;font-size:52px}
    .url{font:800 70px Nunito;background:#FFC23D;color:#1E1B33;border-radius:32px;padding:26px 44px}
    .dot{position:absolute;border-radius:50%}` });
  await p.evaluate((IDS) => {
    const as = IDS.map(id => L(ACTIVITIES.find(a => a.id === id)));
    const dots = Array.from({ length: 26 }, (_, i) => `<i class="dot" style="left:${(i * 137) % 1040}px;top:${(i * 311) % 1880}px;width:${10 + (i % 4) * 6}px;height:${10 + (i % 4) * 6}px;background:${["#FF8A1F", "#FFC23D", "#9B7BFF", "#FFF3E0"][i % 4]};opacity:.35"></i>`).join("");
    document.body.innerHTML = `<div id="s">${dots}
      <div class="sc" id="A"><div class="pill" id="A0">✨ Nouveau sur Fabrikolo</div><div class="big" id="A1">3 nouvelles<br>idées pour<br><span style="color:#FF8A1F">Halloween</span></div><div id="A2">${mascotSVG("m").replace("<svg", '<svg width="300" height="300"')}</div></div>
      ${as.map((a, i) => `<div class="sc" id="B${i}"><div class="pill">✨ ${i + 1} / 3</div><div class="card">${ART[a.id]().replace("<svg", '<svg width="640" height="640"')}</div><div class="mid">${a.titre}</div><div style="font:800 46px Nunito;color:#FFC23D">${t("Dès {n} ans", { n: a.ageMin })} · ⏱ ${t(a.faits[1][1])}</div></div>`).join("")}
      <div class="sc" id="C" style="align-items:flex-start;padding-left:120px"><div class="mid" style="align-self:center;margin-bottom:20px">Sur chaque fiche :</div>
        <div class="chk" id="C0"><b>✓</b>Le matériel à cocher</div><div class="chk" id="C1"><b>✓</b>Les étapes pas à pas</div><div class="chk" id="C2"><b>✓</b>Que faire si ça rate</div><div class="chk" id="C3"><b>✓</b>Tampons et badges</div></div>
      <div class="sc" id="D"><div id="D0">${mascotSVG("m").replace("<svg", '<svg width="260" height="260"')}</div><div class="big" id="D1">${ACTIVITIES.length} activités<br><span style="color:#FF8A1F">gratuites</span></div><div class="url" id="D2">fabrikolo.pages.dev</div><div class="mid" id="D3" style="font-size:58px">Lien en bio 👆</div></div>
    </div>`;
    const ease = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
    const show = (el, t, t0, t1, dy = 60) => { const i = ease((t - t0) / 0.35), o = t1 ? 1 - ease((t - t1) / 0.3) : 1; el.style.opacity = Math.min(i, o); el.style.transform = `translateY(${(1 - i) * dy}px) scale(${0.92 + 0.08 * i})`; };
    window.render = t => {
      const $ = id => document.getElementById(id);
      // Scène A : 0 → 3 s
      $("A").style.opacity = t < 3 ? 1 : 0;
      show($("A0"), t, 0.1); show($("A1"), t, 0.35); show($("A2"), t, 0.8);
      $("A2").style.transform += ` rotate(${Math.sin(t * 6) * 6}deg)`;
      // Scène B : 3 → 11.5 s, 1,7 s par activité
      IDS.forEach((_, i) => { const t0 = 3 + i * 2.5, el = $("B" + i); el.style.opacity = t >= t0 && t < t0 + 2.5 ? 1 : 0;
        const k = ease((t - t0) / 0.4); el.querySelector(".card").style.transform = `translateX(${(1 - k) * 700}px) rotate(${(1 - k) * 8}deg)`;
        el.querySelector(".mid").style.opacity = ease((t - t0 - 0.25) / 0.3); });
      // Scène C : 11.5 → 14.5 s
      $("C").style.opacity = 0;
      
      // Scène D : 14.5 → 18 s
      $("D").style.opacity = t >= 10.5 ? 1 : 0;
      show($("D0"), t, 10.6); show($("D1"), t, 10.8); show($("D2"), t, 11.3); show($("D3"), t, 11.8);
      $("D2").style.transform += ` scale(${1 + Math.max(0, Math.sin((t - 11.6) * 5)) * 0.04})`;
      $("D0").style.transform += ` rotate(${Math.sin(t * 6) * 6}deg)`;
    };
  }, IDS);
  const el = await p.$("#s");
  for (let f = 0; f < FPS * DUREE; f++) {
    await p.evaluate(t => render(t), f / FPS);
    await el.screenshot({ path: path.join(FR, String(f).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 90 });
  }
  await b.close();
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i "${FR}/%04d.jpg" -f lavfi -i anullsrc=r=44100:cl=stereo -shortest -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 20 -c:a aac -movflags +faststart "${OUT}/fabrikolo-nouveautes-semaine.mp4"`);
  fs.rmSync(FR, { recursive: true, force: true });
  console.log("OK", path.join(OUT, "fabrikolo-nouveautes-semaine.mp4"));
})();
