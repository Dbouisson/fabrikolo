// Réel « Nouveau aujourd'hui » : la main de zombie (1080 × 1920, 15 s). node outils/reel-nouveau.js
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs"), { execSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "reel"), FR = path.join(OUT, "frames2");
const FPS = 30, DUREE = 15;
(async () => {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(ROOT, "src", "app.html"));
  await p.evaluate(() => localStorage.setItem("lang", JSON.stringify("fr")));
  await p.reload();
  await p.waitForFunction(() => document.fonts.status === "loaded");
  await p.evaluate(() => Promise.all(['800 90px "Baloo 2"', '800 40px Nunito'].map(f => document.fonts.load(f))));
  await p.addStyleTag({ content: `body::before{display:none!important} html,body{margin:0;background:#15132A;overflow:hidden}
    #s{position:fixed;inset:0;width:1080px;height:1920px;font-family:Nunito,sans-serif;color:#FFF3E0;overflow:hidden;background:radial-gradient(circle at 50% 35%,#24403A,#12112A 70%)}
    .sc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;text-align:center;padding:0 80px}
    .big{font:800 120px/1.02 "Baloo 2",sans-serif;letter-spacing:-2px}
    .mid{font:800 74px/1.1 "Baloo 2",sans-serif}
    .pill{font:800 48px Nunito;background:#FF8A1F;color:#1E1B33;border-radius:999px;padding:16px 42px}
    .step{font:800 62px/1.15 Nunito;max-width:900px}
    .num{display:inline-grid;place-items:center;width:96px;height:96px;border-radius:50%;background:#6BD49A;color:#12112A;font:800 60px "Baloo 2";margin-bottom:10px}
    .url{font:800 70px Nunito;background:#FFC23D;color:#1E1B33;border-radius:32px;padding:26px 44px}` });
  await p.evaluate(() => {
    const scene = `<svg id="pot" viewBox="0 0 200 200" width="760" height="760">
      <circle cx="160" cy="36" r="14" fill="#FFE27A"/><circle cx="36" cy="30" r="2" fill="#fff"/><circle cx="64" cy="52" r="1.6" fill="#fff"/>
      <clipPath id="cp"><rect x="0" y="0" width="200" height="120"/></clipPath><g clip-path="url(#cp)"><g id="hand"><path d="M72 74 C70 60 76 54 80 58 L82 44 C82 36 90 36 90 44 L91 38 C92 30 100 30 100 38 L101 42 C102 34 110 34 110 42 L110 60 C114 54 122 56 120 64 L112 90 C110 100 104 106 96 130 L80 130 C74 104 72 96 72 88 Z" fill="#6BD49A" stroke="#23264B" stroke-width="3" stroke-linejoin="round"/><path d="M84 70 v10 M94 68 v12 M104 70 v10" stroke="#2FB373" stroke-width="2.5" stroke-linecap="round"/></g></g>
      <path d="M44 116 H156 L146 176 C145 182 140 186 134 186 H66 C60 186 55 182 54 176 Z" fill="#E07B3A" stroke="#23264B" stroke-width="3" stroke-linejoin="round"/>
      <path id="soil" d="M40 118 C60 108 80 114 100 108 C120 114 140 108 160 118 L160 124 L40 124 Z" fill="#6B4F2A"/>
      <rect x="40" y="112" width="120" height="16" rx="6" fill="#C8641E" stroke="#23264B" stroke-width="3"/>
      <g id="bub">${[[62, 100], [132, 96], [124, 84], [56, 88], [140, 104], [70, 80]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${3 + (i % 3)}" fill="#fff" opacity=".75"/>`).join("")}</g></svg>`;
    document.body.innerHTML = `<div id="s">
      <div class="sc" id="A"><div class="pill" id="A0">✨ Nouveau aujourd'hui</div><div class="big" id="A1">La main<br>de zombie<br><span style="color:#6BD49A">qui sort de terre</span></div><div class="mid" id="A2" style="font-size:60px;color:#FFC23D">L'expérience d'Halloween 🧟</div></div>
      <div class="sc" id="B" style="justify-content:flex-start;padding-top:180px"><div id="stage">${scene}</div>
        <div class="step" id="S0" style="position:absolute;top:1180px;left:80px;right:80px"><span class="num">1</span><br>Du bicarbonate dans un gobelet troué</div>
        <div class="step" id="S1" style="position:absolute;top:1180px;left:80px;right:80px"><span class="num">2</span><br>Un gant par-dessus, caché sous la terre</div>
        <div class="step" id="S2" style="position:absolute;top:1180px;left:80px;right:80px"><span class="num">3</span><br>Du vinaigre… et la main surgit !</div></div>
      <div class="sc" id="C"><div class="big" style="font-size:150px">🧪</div><div class="mid">Pourquoi ça marche ?</div><div class="step" style="color:#FFE9C8">Vinaigre + bicarbonate<br>= un gaz qui gonfle le gant<br>et soulève la terre</div></div>
      <div class="sc" id="D"><div id="D0">${mascotSVG("m").replace("<svg", '<svg width="240" height="240"')}</div><div class="big" id="D1">Tuto complet<br><span style="color:#6BD49A">gratuit</span></div><div class="mid" id="D4" style="font-size:54px;color:#FFE9C8">Et ${ACTIVITIES.length - 1} autres activités pour les mercredis</div><div class="url" id="D2">fabrikolo.pages.dev</div><div class="mid" id="D3" style="font-size:58px">Lien en bio 👆</div></div>
    </div>`;
    const ease = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
    const show = (el, t, t0, dy = 60) => { const i = ease((t - t0) / 0.35); el.style.opacity = i; el.style.transform = `translateY(${(1 - i) * dy}px) scale(${0.92 + 0.08 * i})`; };
    window.render = t => {
      const $ = id => document.getElementById(id);
      $("A").style.opacity = t < 2.8 ? 1 : 0; show($("A0"), t, 0.1); show($("A1"), t, 0.4); show($("A2"), t, 1.1);
      // Scène B : 2,8 → 9,3 s. Étapes 1-2 : la main est cachée ; étape 3 : elle sort.
      $("B").style.opacity = t >= 2.8 && t < 9.3 ? 1 : 0;
      show($("S0"), t, 3.0); $("S0").style.opacity = t < 5.0 ? $("S0").style.opacity : 0;
      if (t >= 5.0) show($("S1"), t, 5.0); else $("S1").style.opacity = 0; if (t >= 7.0) $("S1").style.opacity = 0;
      if (t >= 7.0) show($("S2"), t, 7.0); else $("S2").style.opacity = 0;
      const rise = ease((t - 7.3) / 1.2), shake = t > 7.2 && t < 8.6 ? Math.sin(t * 60) * 1.2 : 0;
      $("hand").setAttribute("transform", `translate(${shake} ${95 - 95 * rise})`);
      $("bub").style.opacity = t > 7.1 ? 0.3 + 0.7 * Math.abs(Math.sin(t * 7)) : 0;
      $("bub").setAttribute("transform", `translate(0 ${-((t * 30) % 20)})`);
      $("C").style.opacity = t >= 9.3 && t < 11.5 ? 1 : 0; [...$("C").children].forEach((el, i) => show(el, t, 9.4 + i * 0.3));
      $("D").style.opacity = t >= 11.5 ? 1 : 0;
      show($("D0"), t, 11.6); show($("D1"), t, 11.8); show($("D4"), t, 12.2); show($("D2"), t, 12.5); show($("D3"), t, 12.9);
      $("D0").style.transform += ` rotate(${Math.sin(t * 6) * 6}deg)`;
    };
  });
  const el = await p.$("#s");
  for (let f = 0; f < FPS * DUREE; f++) {
    await p.evaluate(t => render(t), f / FPS);
    await el.screenshot({ path: path.join(FR, String(f).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 90 });
  }
  await b.close();
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i "${FR}/%04d.jpg" -f lavfi -i anullsrc=r=44100:cl=stereo -shortest -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 20 -c:a aac -movflags +faststart "${OUT}/fabrikolo-nouveau-main-zombie.mp4"`);
  fs.rmSync(FR, { recursive: true, force: true });
  console.log("OK");
})();
