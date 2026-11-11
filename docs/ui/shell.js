"use strict";
/* Preview shell for one RoverOS style: a phone frame, page list, pager and tour.
   The style registers itself with ROVER.style({ id, name, cap, css, render }). */
const ROVER = { style(s) { this.s = s; } };
const PAGES = [["boot", "Boot"], ["lock", "Lock screen"], ["setup", "First start"], ["home", "Home"], ["quick", "Quick panel"],
  ["nearby", "Nearby devices"], ["device", "Device live"], ["access", "Raw access"], ["network", "Network"], ["term", "Terminal"], ["system", "System"]];
const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];

let frame = [];
(function loop(ts) { for (const f of frame) { try { f(ts); } catch (e) { console.error(e); } } requestAnimationFrame(loop); })(0);
const live = { pw: 142, cd: 84, hr: 128, rssi: [-52, -61, -74] };
setInterval(() => { const r = (a, b) => a + Math.random() * (b - a); live.pw = Math.max(120, Math.min(165, live.pw + r(-6, 6))); live.cd = Math.max(78, Math.min(92, live.cd + r(-2, 2)));
  live.hr = Math.max(121, Math.min(134, live.hr + r(-1.4, 1.5))); live.rssi = [-52, -61, -74].map(v => v + r(-2, 2)); }, 900);
const api = {
  add: f => frame.push(f),
  every(ms, fn, now = true) { let last = now ? -1e9 : null; frame.push(ts => { if (last === null) last = ts; if (ts - last >= ms) { last = ts; fn(ts); } }); },
  canvas(c) { const w = c.offsetWidth, h = c.offsetHeight; c.width = w * 2; c.height = h * 2; const x = c.getContext("2d"); x.scale(2, 2); return [x, w, h]; },
  rnd: (a, b) => a + Math.random() * (b - a), pick: a => a[Math.random() * a.length | 0], live };

let page = "home", tour = false;
function fit() { const st = $(".stage"), s = Math.min(1, (st.clientWidth - 24) / 380, (st.clientHeight - (innerWidth <= 820 ? 130 : 150)) / 820), f = $(".fit");
  f.style.width = 380 * s + "px"; f.style.height = 820 * s + "px"; f.firstElementChild.style.transform = `scale(${s})`; }
function draw() { frame = []; const scr = $(".scr"); scr.innerHTML = ""; scr.className = "scr s-" + ROVER.s.id; ROVER.s.render(scr, page, api);
  $$(".side button").forEach(b => { b.classList.toggle("on", b.dataset.p === page); if (b.dataset.p === page) b.scrollIntoView({ block: "nearest", inline: "center" }); });
  const i = PAGES.findIndex(p => p[0] === page); $(".pager span").textContent = `${i + 1} / ${PAGES.length} · ${PAGES[i][1]}`; history.replaceState(null, "", "#" + page); }
function go(d) { const i = PAGES.findIndex(p => p[0] === page); page = PAGES[(i + d + PAGES.length) % PAGES.length][0]; draw(); }
function boot() { const st = document.createElement("style"); st.textContent = ROVER.s.css; document.head.appendChild(st);
  $(".cap").innerHTML = ROVER.s.cap; $(".side").innerHTML = PAGES.map(([id, n], i) => `<button data-p="${id}"><i>${String(i + 1).padStart(2, "0")}</i>${n}</button>`).join("");
  $(".side").onclick = e => { const b = e.target.closest("button"); if (b) { page = b.dataset.p; draw(); } };
  $("#prev").onclick = () => go(-1); $("#next").onclick = () => go(1);
  $(".tour").onclick = e => { tour = !tour; e.currentTarget.classList.toggle("on", tour); e.currentTarget.textContent = tour ? "■ Stop tour" : "▶ Tour"; };
  setInterval(() => tour && go(1), 6000);
  addEventListener("keydown", e => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
  addEventListener("resize", fit); const h = location.hash.slice(1); if (PAGES.some(p => p[0] === h)) page = h; fit(); draw(); }
addEventListener("DOMContentLoaded", () => Promise.all([...document.fonts].map(f => f.load().catch(() => 0))).then(boot, boot));
