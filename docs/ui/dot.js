ROVER.style((() => {
  const RED = "#ff3126", TAU = Math.PI * 2;
  const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const eo = t => 1 - Math.pow(1 - cl(t), 3);
  const spr = t => { t = cl(t); return 1 - Math.exp(-6.5 * t) * Math.cos(9 * t); };
  const D = (x, px, py, r, a, c) => { if (a <= 0.004 || r <= 0.05) return; x.globalAlpha = a > 1 ? 1 : a; x.fillStyle = c || "#fff"; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); };
  const ic = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const fd = (cx, cy, r, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none" opacity="${o}"/>`;
  const I = {
    back: ic('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
    cell: ic('<path d="M5 19v-3M9.7 19v-6.5M14.3 19V9M19 19V5"/>'),
    wifi: ic('<path d="M3 9.6a13 13 0 0 1 18 0M6.1 13.1a8.5 8.5 0 0 1 11.8 0M9.3 16.5a4 4 0 0 1 5.4 0"/>' + fd(12, 19.4, 1)),
    bt: ic('<path d="m7 7.5 10 9-5 4.5V3l5 4.5-10 9"/>'),
    hot: ic('<circle cx="12" cy="12" r="1.75"/><path d="M8.3 15.7a5.2 5.2 0 0 1 0-7.4M15.7 8.3a5.2 5.2 0 0 1 0 7.4M5.5 18.5a9.2 9.2 0 0 1 0-13M18.5 5.5a9.2 9.2 0 0 1 0 13"/>'),
    raw: ic('<path d="M9 3.5V8M15 3.5V8M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4"/>'),
    sun: ic('<circle cx="12" cy="12" r="3.75"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
    eye: ic('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
    term: ic('<path d="m5 7.5 5.5 4.5L5 16.5M13 17h6"/>'),
    herd: ic('<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5h-7L6.5 20.5V17A2.5 2.5 0 0 1 4 14.5z"/>' + fd(8.5, 10.5, 1) + fd(12, 10.5, 1) + fd(15.5, 10.5, 1)),
    rover: ic('<circle cx="12" cy="12" r="3.25"/><circle cx="12" cy="12" r="8.75" stroke-width="1.9" stroke-dasharray="0.01 4.58"/>'),
    bike: ic('<circle cx="5.75" cy="16" r="3.5"/><circle cx="18.25" cy="16" r="3.5"/><path d="M5.75 16 9 8.5h6.5l2.75 7.5M9.6 10l3.4 6H5.75M13 16l2.5-7.5M7.5 8.5h3M14.5 6h2.5"/>'),
    heart: ic('<path d="M12 20s-7.5-4.5-7.5-10.2a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9C19.5 15.5 12 20 12 20z"/>'),
    car: ic('<path d="M3.5 17v-4l2-5.5a1.5 1.5 0 0 1 1.4-1h10.2a1.5 1.5 0 0 1 1.4 1l2 5.5v4M3.5 13h17M3.5 17h17M6 17v2M18 17v2"/>' + fd(7, 15, .9) + fd(17, 15, .9)),
    cam: ic('<circle cx="12" cy="10" r="6.5"/><circle cx="12" cy="10" r="2.5"/><path d="M7.5 20.5h9M12 16.5v4"/>'),
    lan: ic('<rect x="9" y="3.5" width="6" height="5" rx="1.25"/><rect x="3" y="15.5" width="6" height="5" rx="1.25"/><rect x="15" y="15.5" width="6" height="5" rx="1.25"/><path d="M12 8.5V12M6 15.5V12h12v3.5"/>'),
    usb: ic('<path d="M12 20.5V4M9.5 6.5 12 4l2.5 2.5M12 17l-4.5-3v-2.5M12 14l4.5-2.5V9.5"/>' + fd(7.5, 10, 1.4) + '<path d="M15.25 6.75h2.5v2.5h-2.5z"/>'),
    lock: ic('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    bolt: ic('<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>'),
    sim: ic('<path d="M8 3.5h5.5L18 8v10.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><rect x="9" y="12" width="6" height="5" rx="1"/>'),
    ts: ic([5.5, 12, 18.5].map((y, r) => [5.5, 12, 18.5].map((x, c) => fd(x, y, 1.9, r === 1 || (r === 2 && c === 1) ? 1 : .32)).join("")).join("")),
    check: ic('<path d="m5.5 12.5 4.5 4.5 8.5-10"/>'),
    del: ic('<path d="M9 5.5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9L3 12zM12 9.5l5 5M17 9.5l-5 5"/>'),
    chip: ic('<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3"/>'),
    sync: ic('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/>'),
    left: ic('<path d="M19 12H5M10.5 6.5 5 12l5.5 5.5"/>'), right: ic('<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>'),
    up: ic('<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>'), down: ic('<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>'),
    key: ic('<circle cx="8" cy="12" r="4"/><path d="M12 12h9M17.5 12v3M20.5 12v2"/>'),
  };
  const dots = (n, on) => `<span class="dots">${Array.from({ length: n }, (_, i) => `<i${i < on ? "" : ' class="o"'}></i>`).join("")}</span>`;
  const sb = (left = "09:42", bat = 82) => `<div class="sb"><span>${left}</span><span class="sb-r">${dots(4, 3)}<span>4G</span><i class="bat"><i style="width:${bat}%"></i></i><span>${bat}</span></span></div>`;
  const hd = (title, right = "") => `<div class="hd"><div class="bk">${I.back}</div><div class="hd-t D">${title}</div>${right}</div>`;
  const W = (x, y, w, h, i, cls, html) => `<div class="w ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--i:${i}">${html}</div>`;
  const LIVE = `<span class="live"><i class="ld"></i>Live</span>`;
  const HI = `<div class="hi"></div>`;
  const PT = `<i class="pt"></i>`, CK = (a, b) => `<span>${a}</span><i class="col"><b></b><b></b></i><span>${b}</span>`;
  const count = (api, el, to, ms = 1000, dec = 0, delay = 0) => { let t0, done, was; api.add(ts => { if (done) return; t0 ??= ts; const k = eo((ts - t0 - delay) / ms), s = (to * k).toFixed(dec); if (s !== was) { was = s; el.innerHTML = s.replace(".", PT); } if (k >= 1) done = 1; }); };

  /* scrolling dot-matrix chart of live power */
  function chart(api, cv, p, ms) {
    const [x, w, h] = api.canvas(cv), cols = Math.ceil(w / p) + 2, rows = Math.floor(h / p), buf = [];
    let v = 140, last = 0, t0;
    for (let i = 0; i < cols; i++) { v = cl(v + api.rnd(-8, 8), 120, 165); buf.push(v); }
    api.add(ts => {
      t0 ??= ts; if (ts - last > ms) { last = ts; buf.push(cl(api.live.pw + 13 * Math.sin(ts / 2100) + api.rnd(-5, 5), 114, 172)); buf.shift(); }
      const f = eo((ts - last) / (ms * .7)), grow = eo((ts - t0) / 900);
      x.clearRect(0, 0, w, h);
      for (let c = 0; c < cols; c++) {
        const px = w + p / 2 - f * p - (cols - 1 - c) * p; if (px < -p) continue;
        const edge = cl(px / 36), lv = Math.max(1, Math.round((buf[c] - 98) / 92 * rows * grow));
        for (let r = 0; r < rows; r++) {
          const py = h - p / 2 - r * p, top = r === lv - 1, head = c === cols - 1;
          if (r >= lv) D(x, px, py, p * .12, .16 * edge);
          else D(x, px, py, top ? p * .34 : p * .24, (top ? 1 : .38) * edge, top && head ? RED : "#fff");
        }
      }
      x.globalAlpha = 1;
    });
  }
  /* ring of dots lit up to a fraction */
  function ring(x, cx, cy, R, n, frac, a0, sweep, r, ts) {
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), a = a0 + sweep * k, on = k <= frac + 1e-6, sh = on ? .5 + .5 * Math.sin(ts / 420 - i * .45) : 0;
      D(x, cx + Math.cos(a) * R, cy + Math.sin(a) * R, on ? r + sh * .5 : r * .55, on ? .78 + .22 * sh : .24);
    }
  }

  const P = {};

  /* ───── boot ───── */
  P.boot = (scr, api) => {
    scr.innerHTML = `<canvas class="full"></canvas><div class="bt-w D">${[..."RoverOS"].map(c => `<span>${c}</span>`).join("")}</div><div class="bt-s"><span class="bt-st"></span><span class="bt-p D">0</span></div>`;
    const [x, w, h] = api.canvas(scr.querySelector("canvas")), G = ["1111111.", "11111111", "11....11", "11....11", "11111111", "1111111.", "11..11..", "11...11.", "11....11", "11....11"];
    const cx = 180, cy = 292, p = 13, pts = [];
    for (let r = -8; r <= 8; r++) for (let c = -8; c <= 8; c++) { const d = Math.hypot(r, c); if (d > 8.4) continue; const a = api.rnd(0, TAU), q = api.rnd(260, 520);
      pts.push({ tx: cx + c * p, ty: cy + r * p, sx: cx + Math.cos(a) * q, sy: cy + Math.sin(a) * q, d, dl: api.rnd(0, 500), g: (G[r + 5] || "")[c + 4] === "1" }); }
    const L = [...scr.querySelectorAll(".bt-w span")], st = scr.querySelector(".bt-st"), pc = scr.querySelector(".bt-p");
    const steps = ["kernel 7.1", "slot A · 0.3.1", "modem · du 4G", "tailscale up", "bluetooth", "ready"]; let t0, sl = -1;
    api.add(ts => {
      t0 ??= ts; const t = (ts - t0) % 5200, out = eo((t - 4500) / 600);
      x.clearRect(0, 0, w, h);
      for (const q of pts) {
        const k = spr((t - q.dl) / 900), px = q.sx + (q.tx - q.sx) * k, py = q.sy + (q.ty - q.sy) * k;
        const lit = q.g ? eo((t - 1300 - q.d * 45) / 260) : 0, wv = Math.exp(-Math.pow((q.d - ((t - 1300) / 1500 % 1) * 12) / 1.5, 2)) * (t > 1300 ? 1 : 0);
        const sh = 1 - cl(out * 1.6 - q.d * .07);
        D(x, px, py, (1.6 + lit * 3 + wv * 1.1) * sh, (.2 + lit * .8 + wv * .3) * cl((t - q.dl) / 300));
      }
      const pr = eo((t - 1500) / 2700), n = 22, lp = 12, lx = cx - (n - 1) * lp / 2, ly = 668, on = Math.floor(pr * n), m = Math.floor(t / 90) % n;
      for (let i = 0; i < n; i++) D(x, lx + i * lp, ly, i < on ? 2.6 : i === m && pr < 1 ? 2.2 : 1.4, (i < on ? 1 : i === m && pr < 1 ? .7 : .24) * cl((t - 1300) / 300) * (1 - out));
      x.globalAlpha = 1;
      L.forEach((e, i) => { const k = spr((t - 1700 - i * 80) / 600) * (1 - out); e.style.opacity = cl(k * 1.4); e.style.transform = `translateY(${(1 - k) * 14}px)`; });
      const fa = cl((t - 1400) / 300) * (1 - out); st.parentNode.style.opacity = fa;
      const si = Math.min(steps.length - 1, Math.floor(pr * steps.length)); if (si !== sl) { sl = si; st.textContent = steps[si]; }
      const pt = Math.round(pr * 100) + "%"; if (pc.textContent !== pt) pc.textContent = pt;
    });
  };

  /* ───── lock ───── */
  P.lock = (scr, api) => {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "x"];
    scr.innerHTML = sb("du") + `<div class="lk-date">Wed 11 Nov</div>
      <div class="lk-clock D">${CK("09", "41")}</div>
      ${W(24, 222, 312, 68, 1, "lk-live", `<i class="ld"></i><div><b>coach is using the bike</b><small>Tailnet up · Technogym Ride</small></div><canvas></canvas>`)}
      <div class="lk-pin"><i></i><i></i><i></i><i></i></div>
      <div class="lk-pad">${keys.map((k, i) => k === "" ? "<span></span>" : `<div class="k D" data-k="${k}" style="--i:${i}">${k === "x" ? I.del : k}</div>`).join("")}</div>` + HI;
    const [x, w, h] = api.canvas(scr.querySelector(".lk-live canvas"));
    api.add(ts => { x.clearRect(0, 0, w, h); for (let i = 0; i < 7; i++) { const a = .5 + .5 * Math.sin(ts / 260 - i * .8), n = 1 + Math.round(a * 3); for (let j = 0; j < 4; j++) D(x, 4 + i * 8, h - 5 - j * 8, j < n ? 2.4 : 1.2, j < n ? (j === n - 1 ? 1 : .5) : .2); } x.globalAlpha = 1; });
    const pin = [2, 7, 4, 1], pd = [...scr.querySelectorAll(".lk-pin i")], pw = scr.querySelector(".lk-pin"), K = k => scr.querySelector(`.k[data-k="${k}"]`);
    let t0, last = -1;
    api.add(ts => {
      t0 ??= ts; const t = (ts - t0) % 5600, n = t < 900 ? 0 : Math.min(4, 1 + Math.floor((t - 900) / 620)), ph = t > 4900 ? 0 : n;
      const st = ph * 10 + (t > 3400 && t <= 4900 ? 1 : 0);
      if (st !== last) { last = st; pd.forEach((e, i) => e.classList.toggle("on", i < ph)); pw.classList.toggle("ok", st % 10 === 1); }
      pin.forEach((k, i) => { const dt = t - 900 - i * 620; K(k).classList.toggle("hit", dt >= 0 && dt < 200); });
    });
  };

  /* ───── setup ───── */
  P.setup = (scr, api) => {
    scr.innerHTML = sb() + `<div class="su-step"><span class="lab">Step 1 of 3</span><span class="su-seg"><i class="on"></i><i></i><i></i></span></div>
      <div class="su-t D">Approve<br>this Rover</div>
      ${W(24, 188, 312, 288, 1, "su-qr", `<canvas></canvas><i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i>`)}
      <div class="su-cap">Scan with a phone that is signed in to your tailnet.</div>
      ${W(24, 544, 98, 124, 2, "su-tile", `${I.sim}<span class="lab">SIM</span><b>du 4G</b><small>${I.check}Ready</small>`)}
      ${W(131, 544, 98, 124, 3, "su-tile now", `${I.ts}<span class="lab">Tailscale</span><b>Waiting</b><small>for approval</small><i class="march"></i>`)}
      ${W(238, 544, 98, 124, 4, "su-tile nx", `${I.lock}<span class="lab">PIN</span><b>Next</b><small>4 digits</small>`)}
      <div class="su-foot">${I.key}<span>No key is typed or stored.</span></div>` + HI;
    const [x, w, h] = api.canvas(scr.querySelector(".su-qr canvas")), N = 29, p = 8, ox = (w - N * p) / 2 + p / 2, oy = (h - N * p) / 2 + p / 2, M = [];
    let s = 20261111; const rn = () => (s = s * 16807 % 2147483647) / 2147483647;
    const fin = (r, c) => { for (const [a, b] of [[0, 0], [0, N - 7], [N - 7, 0]]) { const dr = r - a, dc = c - b; if (dr >= -1 && dr <= 7 && dc >= -1 && dc <= 7) { if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return 0; const m = Math.max(Math.abs(dr - 3), Math.abs(dc - 3)); return m === 2 ? 0 : 2; } } return -1; };
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      let f = fin(r, c), on;
      if (f >= 0) on = f; else { const ar = Math.abs(r - 22), ac = Math.abs(c - 22), m = Math.max(ar, ac); on = m <= 2 ? (m === 1 ? 0 : 1) : r === 6 || c === 6 ? (r + c) % 2 === 0 : rn() < .48; }
      if (on) M.push({ r, c, f: on === 2 });
    }
    let t0; api.add(ts => {
      t0 ??= ts; const t = ts - t0, sc = (t / 2600 % 1) * (N + 12) - 6;
      x.clearRect(0, 0, w, h);
      for (const m of M) { const k = spr((t - (m.r + m.c) * 16) / 620), g = Math.exp(-Math.pow((m.r - sc) / 2.4, 2)); D(x, ox + m.c * p, oy + m.r * p, (m.f ? 3.9 : 2.5 + g * 1.1) * k, m.f ? 1 : .7 + g * .3); }
      x.globalAlpha = 1;
    });
  };

  /* ───── home ───── */
  P.home = (scr, api) => {
    const HG = [".11...11.", "1111.1111", "111111111", "111111111", ".1111111.", "..11111..", "...111...", "....1...."];
    scr.innerHTML = sb("du") + `<div class="hm-clock D"><span>09</span><span>42</span></div>
      <div class="hm-date"><b>Wed</b><span>11 Nov</span></div>
      ${W(212, 136, 124, 124, 1, "hm-bat", `<canvas></canvas><div><b class="D">0</b><small>% battery</small></div>`)}
      ${W(24, 276, 312, 112, 2, "hm-live", `<div class="tx">${LIVE}<b>Technogym Ride</b><small>read by coach@pi-burj</small></div><canvas></canvas>`)}
      ${W(24, 396, 152, 152, 3, "hm-hr", `<span class="lab">Polar H10</span><canvas></canvas><div class="n"><b class="D">128</b><small>bpm</small></div>`)}
      ${W(184, 396, 152, 152, 4, "hm-ses", `<span class="lab">Agent sessions</span><div class="n"><b class="D">2</b></div><ul><li><i class="march"></i>pi-burj</li><li><i class="march"></i>hetzner</li></ul>`)}
      ${W(24, 556, 140, 72, 5, "hm-pill", `${I.cell}<div><b>du 4G</b><small>1.2 of 10 GB</small></div>`)}
      ${W(172, 556, 164, 72, 6, "hm-pill", `${I.ts}<div><b>Tailscale</b><small>Direct · 6 machines</small></div>`)}
      <div class="hm-dock">${[["herd", "HerdrUp", " pri"], ["term", "Terminal", ""], ["rover", "Rover", ""]].map(([k, n, c], i) => `<div class="app" style="--i:${7 + i}"><i class="${c}">${I[k]}</i><span>${n}</span></div>`).join("")}</div>` + HI;
    const bn = scr.querySelector(".hm-bat b"); count(api, bn, 82, 1200, 0, 200);
    { const [x, w, h] = api.canvas(scr.querySelector(".hm-bat canvas")); let t0; api.add(ts => { t0 ??= ts; x.clearRect(0, 0, w, h); ring(x, w / 2, h / 2, 50, 32, .82 * eo((ts - t0 - 200) / 1200), -Math.PI / 2, TAU * 31 / 32, 2.6, ts); x.globalAlpha = 1; }); }
    chart(api, scr.querySelector(".hm-live canvas"), 8, 520);
    { const [x, w, h] = api.canvas(scr.querySelector(".hm-hr canvas")), p = 6, hn = scr.querySelector(".hm-hr b"); let ph = 0, lt;
      api.add(ts => { const dt = lt ? ts - lt : 0; lt = ts; ph = (ph + dt * api.live.hr / 60000) % 1; const b = Math.exp(-Math.pow((ph - .08) / .05, 2)) + .6 * Math.exp(-Math.pow((ph - .3) / .06, 2));
        x.clearRect(0, 0, w, h); HG.forEach((row, r) => [...row].forEach((c, i) => { const d = Math.hypot(i - 4, r - 3) / 5; D(x, i * p + p / 2, r * p + p / 2 + 1, c === "1" ? 1.9 + b * .9 * (1 - d * .5) : .9, c === "1" ? .8 + b * .2 : .16); })); x.globalAlpha = 1; });
      api.every(900, () => { hn.textContent = Math.round(api.live.hr); }); }
  };

  /* ───── quick panel ───── */
  P.quick = (scr, api) => {
    const tile = (x, y, i, k, n, s, on, id = "") => W(x, y, 152, 108, i, "qk-tile" + (on ? " on" : "") + id, `<i class="ci">${I[k]}</i><i class="st"></i><b>${n}</b><small>${s}</small>`);
    const rnd = (i, k, n, s, on) => `<div class="qk-r${on ? " on" : ""}" style="--i:${i}"><i>${I[k]}</i><b>${n}</b><small>${s}</small></div>`;
    scr.innerHTML = sb() + `<div class="qk-top"><div class="D">${CK("09", "42")}</div><span>Wed 11 Nov</span></div>
      ${tile(24, 116, 1, "cell", "Mobile data", "du 4G", 1)}${tile(184, 116, 2, "wifi", "Wi-Fi", "Home", 1)}
      ${tile(24, 232, 3, "bt", "Bluetooth", "3 devices", 1)}${tile(184, 232, 4, "hot", "Hotspot", "Off", 0, " hs")}
      <div class="qk-row">${rnd(5, "raw", "Raw access", "2 sessions", 1)}${rnd(6, "eye", "Stay awake", "While charging", 1)}${rnd(7, "globe", "Roaming", "Off", 0)}</div>
      ${W(24, 484, 312, 72, 8, "qk-br", `${I.sun}<canvas></canvas>`)}
      ${W(24, 568, 312, 148, 9, "qk-bat", `<div class="n"><b class="D">0</b><span class="u">%</span></div><div class="t"><span class="lab">Battery</span><b>About 9 h awake</b></div><canvas></canvas>`)}
      <div class="qk-grab"></div>`;
    count(api, scr.querySelector(".qk-bat b"), 82, 1200, 0, 400);
    { const [x, w, h] = api.canvas(scr.querySelector(".qk-br canvas")), n = 20, p = w / n; let t0;
      api.add(ts => { t0 ??= ts; const lv = (.62 + .1 * Math.sin((ts - t0) / 1300)) * eo((ts - t0 - 300) / 900) * n; x.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) { const k = cl(lv - i); D(x, p / 2 + i * p, h / 2, 1.5 + (1.6 + i * .11) * k, .26 + .74 * k); } x.globalAlpha = 1; }); }
    { const [x, w, h] = api.canvas(scr.querySelector(".qk-bat canvas")), n = 25, p = w / n; let t0;
      api.add(ts => { t0 ??= ts; const f = .82 * eo((ts - t0 - 400) / 1200) * n, m = (ts / 110) % (n * 1.6); x.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const on = i < f, g = on ? Math.exp(-Math.pow((i - m) / 2, 2)) : 0; D(x, p / 2 + i * p, h / 2 + (j - 1) * p, on ? 3 + g * .8 : 1.5, on ? .72 + g * .28 : .22); } x.globalAlpha = 1; }); }
    const hs = scr.querySelector(".hs"), hss = hs.querySelector("small"); let t0, was = 0;
    api.add(ts => { t0 ??= ts; const on = (ts - t0) % 6400 > 4200 ? 1 : 0; if (on !== was) { was = on; hs.classList.toggle("on", !!on); hss.textContent = on ? "Rover-4G" : "Off"; } });
  };

  /* ───── nearby ───── */
  P.nearby = (scr, api) => {
    const dev = [
      { k: "bike", n: "Technogym Ride", x: -44, y: -44, s: "Bluetooth", f: "coach · in use", live: 1, ri: 0, up: 1 },
      { k: "heart", n: "Polar H10", x: 88, y: -22, s: "Bluetooth", f: "128 bpm · linked", ri: 1, up: 1 },
      { k: "car", n: "Vgate OBD2", x: -55, y: 99, s: "Bluetooth", f: "Paired · in range", ri: 2 },
      { k: "cam", n: "Logitech C270", x: 55, y: 77, s: "USB", f: "Through the hub", usb: 1 }];
    scr.innerHTML = sb() + hd("Nearby", `<span class="hd-n"><b class="D">4</b>devices</span>`) + `<div class="nb-radar"><canvas></canvas>
      ${dev.map((d, i) => `<div class="nb-l${d.up ? " up" : ""}" style="left:${180 + d.x}px;top:${164 + d.y}px;--i:${i}"><b>${d.n}</b><small>${d.usb ? "USB" : ""}</small></div>`).join("")}</div>
      ${dev.map((d, i) => W(24 + (i % 2) * 160, 440 + (i >> 1) * 108, 152, 100, i + 1, "nb-c", `<div class="h">${I[d.k]}${d.live ? LIVE : ""}</div><b>${d.n}</b><small>${d.s}<span></span></small><small class="f">${d.f}</small>`)).join("")}
      ${W(24, 660, 312, 76, 5, "nb-raw", `<i class="ci">${I.raw}</i><div><b>Raw access</b><small>Agents may use these devices</small></div><i class="sw on"></i>`)}` + HI;
    const [x, w, h] = api.canvas(scr.querySelector(".nb-radar canvas")), cx = 180, cy = 164, p = 11, R = 158, pts = [];
    for (let gy = -15; gy <= 15; gy++) for (let gx = -15; gx <= 15; gx++) { const d = Math.hypot(gx, gy) * p; if (d <= R) pts.push([gx * p, gy * p, d]); }
    const rs = [...scr.querySelectorAll(".nb-l small")], cs = [...scr.querySelectorAll(".nb-c small:not(.f) span")], hr = scr.querySelector(".nb-c:nth-of-type(3) .f");
    api.every(900, () => { dev.forEach((d, i) => { if (d.usb) return; const v = "−" + Math.abs(Math.round(api.live.rssi[d.ri])) + " dBm"; rs[i].textContent = v; cs[i].textContent = " · " + v; }); });
    let t0; api.add(ts => {
      t0 ??= ts; const t = ts - t0, wv = (t / 2800 % 1) * R * 1.25, ap = eo(t / 1100);
      x.clearRect(0, 0, w, h);
      for (const [gx, gy, d] of pts) {
        if (d > ap * R) continue;
        const g = Math.exp(-Math.pow((d - wv) / 15, 2)) * (1 - wv / (R * 1.25) * .5), rg = d % 55 < 5.5 && d > 20 ? .2 : 0;
        let a = .27 + rg + g * .7, r = 1.45 + g * 1.7, red = 0;
        const c0 = Math.exp(-d * d / 200); if (c0 > .02) { a = Math.max(a, c0 * 1.6); r += c0 * 3.2; }
        for (let i = 0; i < 4; i++) { const q = dev[i], dd = Math.hypot(gx - q.x, gy - q.y), qd = Math.hypot(q.x, q.y), fl = Math.exp(-Math.pow((qd - wv + 10) / 30, 2)), k = Math.exp(-dd * dd / (100 + 120 * fl)) * spr((t - 700 - i * 220) / 700);
          if (k > .02) { a = Math.max(a, k * 1.6); r = Math.min(5.2, Math.max(r, 1.4 + k * 4.4)); if (q.live && dd < 1) red = 1; }
          if (q.usb) { const tt = cl((gx * q.x + gy * q.y) / (qd * qd)), ld = Math.hypot(gx - q.x * tt, gy - q.y * tt); if (ld < 5 && d > 14 && dd > 12) { a = Math.max(a, .8); r = Math.max(r, 2); } } }
        D(x, cx + gx, cy + gy, r, a, red ? RED : "#fff");
      }
      x.globalAlpha = 1;
    });
  };

  /* ───── device live ───── */
  P.device = (scr, api) => {
    scr.innerHTML = sb() + hd("Technogym Ride", "") + `<div class="dv-sub">${LIVE}<span>Claimed by coach@pi-burj · FTMS</span></div>
      <div class="dv-g"><canvas></canvas><div class="c"><b class="D">142</b><span class="lab">Watts</span></div></div>
      ${W(24, 340, 152, 84, 1, "dv-m", `<span class="lab">Cadence</span><div><b class="D" data-v="cd">84</b><small>rpm</small></div><i class="dv-sp"></i>`)}
      ${W(184, 340, 152, 84, 2, "dv-m", `<span class="lab">Heart rate</span><div><b class="D" data-v="hr">128</b><small>bpm</small></div><i class="dv-bt"></i>`)}
      ${W(24, 432, 312, 132, 3, "dv-ch", `<div class="h"><span class="lab">Power · last 60 s</span><span class="lab">W</span></div><canvas></canvas>`)}
      ${W(24, 572, 312, 100, 4, "dv-log", `<div class="ll"></div>`)}
      <div class="dv-btn w" style="--i:5">Release claim</div>` + HI;
    const [x, w, h] = api.canvas(scr.querySelector(".dv-g canvas")), pn = scr.querySelector(".dv-g b"), cd = scr.querySelector('[data-v="cd"]'), hr = scr.querySelector('[data-v="hr"]'), bt = scr.querySelector(".dv-bt"), sp = scr.querySelector(".dv-sp");
    let v = 0, t0, shown = -1, ph = 0, lt;
    api.add(ts => {
      t0 ??= ts; const dt = lt ? Math.min(50, ts - lt) : 16; lt = ts; v += (api.live.pw - v) * (1 - Math.exp(-dt / 320));
      const n = 54, a0 = Math.PI * .75, sw = Math.PI * 1.5, f = v / 250, cx = w / 2, cy = 118;
      x.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) { const k = i / (n - 1), a = a0 + sw * k, on = k <= f, hdot = Math.abs(k - f) < .5 / n, rp = on ? Math.exp(-Math.pow((k * n - ((ts / 60) % (n * 1.5))) / 3, 2)) : 0;
        D(x, cx + Math.cos(a) * 104, cy + Math.sin(a) * 104, on ? 3.4 + rp * .9 + (hdot ? 1.4 : 0) : 1.7, on ? .8 + rp * .2 : .25);
        if (i % 9 === 0 || i === n - 1) D(x, cx + Math.cos(a) * 88, cy + Math.sin(a) * 88, 1.3, .45); }
      x.globalAlpha = 1; const r = Math.round(v); if (r !== shown) { shown = r; pn.textContent = r; }
      ph = (ph + dt * api.live.hr / 60000) % 1; const b = Math.exp(-Math.pow((ph - .1) / .07, 2)); bt.style.transform = `scale(${1 + b * .7})`; bt.style.opacity = .55 + b * .45;
      sp.style.transform = `rotate(${ts * api.live.cd / 60000 * 360}deg)`;
    });
    api.every(900, () => { cd.textContent = Math.round(api.live.cd); hr.textContent = Math.round(api.live.hr); });
    chart(api, scr.querySelector(".dv-ch canvas"), 8, 480);
    const ll = scr.querySelector(".ll"), hx = n => Array.from({ length: n }, () => (Math.random() * 256 | 0).toString(16).padStart(2, "0").toUpperCase()).join(" "); let sec = 7, cnt = 0, lt2 = 0;
    const line = () => { const k = cnt++ % 4, s = String(sec).padStart(2, "0"); if (k === 3) sec = (sec + 1) % 60; return `<div><span>09:42:${s}</span> ${k === 1 ? `<i>←</i> 2A37 hr   16 ${Math.round(api.live.hr).toString(16).toUpperCase()}` : k === 3 ? `<i>→</i> 2AD9 ctl  00 ${hx(1)}` : `<i>←</i> 2AD2 bike 44 02 ${hx(3)}`}</div>`; };
    ll.innerHTML = line() + line() + line() + line() + line();
    api.add(ts => { if (!lt2) lt2 = ts; const k = eo((ts - lt2) / 260); ll.style.transform = `translateY(${-k * 19}px)`; if (ts - lt2 > 620) { lt2 = ts; ll.firstChild.remove(); ll.insertAdjacentHTML("beforeend", line()); ll.style.transform = "none"; } });
  };

  /* ───── raw access ───── */
  P.access = (scr, api) => {
    const ses = [["pi-burj", "coach", "Shell · since 07:14", 1], ["hetzner", "car", "Shell · since 08:02", 1], ["mac", "jerry", "22:10 – 22:41", 0]];
    scr.innerHTML = sb() + hd("Raw access") + W(24, 100, 312, 228, 1, "ac-hero", `<div class="h"><span class="lab">Agents</span><span class="lab">Devices</span></div><canvas></canvas>
        <div class="r"><b class="D">ON</b><i class="sw big on"></i></div><p><b>All raw access</b><br>One switch cuts every agent off.</p>`)
      + W(24, 336, 98, 128, 2, "ac-ch on", `${I.term}<b>Shell</b><small>SSH into the workspace</small><i class="sw sm on"></i>`)
      + W(131, 336, 98, 128, 3, "ac-ch", `${I.lan}<b>LAN</b><small>Reach this Wi-Fi's devices</small><i class="sw sm"></i>`)
      + W(238, 336, 98, 128, 4, "ac-ch na", `${I.usb}<b>USB</b><small>Not on this kernel yet</small>`)
      + W(24, 472, 312, 252, 5, "ac-ses", `<div class="h"><span class="lab">Sessions</span><span class="lab">2 open</span></div>${ses.map(s => `<div class="row"><div><b>${s[0]}<em> · ${s[1]}</em></b><small>${s[2]}</small></div>${s[3] ? `<span class="live"><i class="ld"></i>Open</span>` : `<span class="cl">Closed</span>`}</div>`).join("")}`) + HI;
    const [x, w, h] = api.canvas(scr.querySelector(".ac-hero canvas")), hero = scr.querySelector(".ac-hero"), big = hero.querySelector("b"), sw = hero.querySelector(".sw"), sh = scr.querySelector(".ac-ch .sw"), op = [...scr.querySelectorAll(".ac-ses .live")];
    let t0, was = 1, gate = 1, off = 0, lt;
    api.add(ts => {
      t0 ??= ts; const dt = lt ? Math.min(50, ts - lt) : 16; lt = ts; const on = (ts - t0) % 9000 < 7000 ? 1 : 0;
      if (on !== was) { was = on; big.textContent = on ? "ON" : "OFF"; sw.classList.toggle("on", !!on); sh.classList.toggle("on", !!on); hero.classList.toggle("off", !on); op.forEach(e => e.classList.toggle("cut", !on)); }
      gate += (on - gate) * (1 - Math.exp(-dt / 160)); off += dt * .034;
      x.clearRect(0, 0, w, h); const p = 12, gx = w / 2, ys = [10, 28, 46];
      ys.forEach((y, li) => { const pp = (off * 3.2 + li * 97) % (w + 80) - 40; for (let i = 0; i < w / p + 2; i++) { const px = i * p + (off + li * 4) % p - p, right = px > gx; if (Math.abs(px - gx) < 8) continue;
        const pk = Math.exp(-Math.pow((px - pp) / 13, 2)) * (right ? gate : 1);
        D(x, px, y, right ? 1.4 + 1.4 * gate + pk * 1.2 : 2.2 + pk * 1.3, (right ? .22 + .6 * gate : .45) + pk * .55); } });
      for (let j = 0; j < 5; j++) D(x, gx, 4 + j * 12, 3.4 - gate * 1.8, 1 - gate * .5);
      x.globalAlpha = 1;
    });
  };

  /* ───── network ───── */
  P.network = (scr, api) => {
    scr.innerHTML = sb() + hd("Network") + W(24, 100, 312, 200, 1, "nw-hero", `<span class="lab">Mobile · du 4G</span><div class="n"><b class="D">0${PT}0</b><span class="u">GB</span></div><p><b>of 10 GB</b><br>19 days left</p><canvas></canvas>`)
      + W(24, 308, 152, 68, 2, "nw-p", `<div><b>Roaming</b><small>Off</small></div><i class="sw"></i>`)
      + W(184, 308, 152, 68, 3, "nw-p", `<div><b>Hotspot</b><small>Off</small></div><i class="sw"></i>`)
      + W(24, 384, 312, 148, 4, "nw-wifi", `<span class="lab">Wi-Fi</span><div class="row">${I.wifi}<div><b>Home</b><small>Joined · strong</small></div>${dots(4, 4)}</div><div class="row dm">${I.wifi}<div><b>Gym-Guest</b><small>Saved · login page</small></div>${dots(4, 2)}</div>`)
      + W(24, 540, 312, 188, 5, "nw-ts", `<canvas></canvas><div class="t"><span class="lab">Tailscale</span><b class="D">Direct</b><small>6 machines</small></div><code>rover.tail1234.ts.net</code>`) + HI;
    count(api, scr.querySelector(".nw-hero b"), 1.2, 1300, 1, 300);
    { const [x, w, h] = api.canvas(scr.querySelector(".nw-hero canvas")), p = w / 10; let t0;
      api.add(ts => { t0 ??= ts; const t = ts - t0, lit = 12 * eo((t - 300) / 1300), wv = (t / 2600 % 1) * 16;
        x.clearRect(0, 0, w, h); for (let i = 0; i < 100; i++) { const c = i % 10, r = 9 - (i / 10 | 0), k = cl(lit - i), ap = spr((t - (c + (9 - r)) * 28) / 600), g = Math.exp(-Math.pow((c + 9 - r - wv) / 1.6, 2)), cur = i === 11 && lit >= 11.9 ? .5 + .5 * Math.sin(ts / 300) : 1;
          D(x, p / 2 + c * p, p / 2 + r * p, (1.5 + g * .5 + k * (2.5 * cur + 0.6)) * ap, .24 + g * .12 + k * .76); } x.globalAlpha = 1; }); }
    { const [x, w, h] = api.canvas(scr.querySelector(".nw-ts canvas")), cx = w / 2, cy = h / 2, R = 52; let t0;
      api.add(ts => { t0 ??= ts; const t = ts - t0; x.clearRect(0, 0, w, h);
        for (let m = 0; m < 6; m++) { const a = -Math.PI / 2 + m * TAU / 6, ap = spr((t - 300 - m * 110) / 700), n = 5;
          for (let j = 1; j <= n; j++) { const q = j / (n + 1), ph = ((t / 1500 + m * .37) % 1), g = Math.exp(-Math.pow((q - (m % 2 ? 1 - ph : ph)) / .16, 2)); D(x, cx + Math.cos(a) * R * q * ap, cy + Math.sin(a) * R * q * ap, 1.3 + g * 1.2, .3 + g * .7); }
          D(x, cx + Math.cos(a) * R * ap, cy + Math.sin(a) * R * ap, 4.6, 1); }
        D(x, cx, cy, 8.5, 1); D(x, cx, cy, 5, 1, "#131313"); D(x, cx, cy, 2.2, 1); x.globalAlpha = 1; }); }
  };

  /* ───── terminal ───── */
  P.term = (scr, api) => {
    const S = [["rover status", ["tailnet   up · direct · 6 machines", "mobile    du 4G · 1.2 / 10 GB", "raw       on · 2 sessions", "nearby    4 devices · 1 claimed", "battery   82% · about 9 h"]],
      ["bluetoothctl devices", ["Device F4:5E:AB:21:9C:02 Technogym Ride", "Device C7:1B:6E:90:3A:D4 Polar H10", "Device 00:1D:A5:68:98:8B Vgate OBD2"]],
      ["rover claim bike", ["claiming Technogym Ride …", "claimed for coach@pi-burj · FTMS"]],
      ["herdr agent start claude", ["agent claude started", "session 3 · raw access granted"]]];
    scr.innerHTML = sb() + W(24, 52, 312, 132, 1, "tm-b", `<div class="bk">${I.back}</div><div class="t"><b class="D">rover$</b><small>RoverOS 0.3.1 · kernel 7.1 · pts/0</small></div><canvas></canvas><span class="lab ld1">Load</span>`)
      + `<div class="tm-o"></div><div class="tm-k">${["Esc", "Tab", "Ctrl"].map(k => `<span>${k}</span>`).join("")}${["left", "up", "down", "right"].map(k => `<span>${I[k]}</span>`).join("")}</div>` + HI;
    { const [x, w, h] = api.canvas(scr.querySelector(".tm-b canvas")), p = 8, cols = Math.floor(w / p), ld = Array.from({ length: cols }, () => api.rnd(.15, .5)); let last = 0;
      api.add(ts => { if (ts - last > 240) { last = ts; ld.push(cl(ld[ld.length - 1] + api.rnd(-.22, .22), .1, 1)); ld.shift(); } x.clearRect(0, 0, w, h);
        for (let c = 0; c < cols; c++) { const lv = Math.max(1, Math.round(ld[c] * 4)); for (let r = 0; r < 4; r++) D(x, p / 2 + c * p, h - p / 2 - r * p, r < lv ? (r === lv - 1 ? 2.6 : 2) : 1, r < lv ? (r === lv - 1 ? 1 : .4) : .16); } x.globalAlpha = 1; }); }
    const o = scr.querySelector(".tm-o"), ev = []; let T = 500;
    const pr = `<span class="p">rover$</span> `;
    S.forEach(([cmd, out]) => { for (let i = 1; i <= cmd.length; i++) { T += 48 + (cmd[i - 1] === " " ? 70 : 0); ev.push([T, "type", cmd.slice(0, i)]); } T += 380; ev.push([T, "enter"]); out.forEach(l => { T += 110; ev.push([T, "out", l]); }); T += 150; ev.push([T, "prompt"]); T += 800; });
    T += 2600; let t0, ei = 0, cur;
    const prompt = () => { o.insertAdjacentHTML("beforeend", `<div class="c">${pr}<span class="x"></span><i class="cu"></i></div>`); cur = o.lastChild.querySelector(".x"); };
    const reset = () => { o.innerHTML = `<div class="o dm">Last login: Wed 11 Nov 09:40 from pi-burj</div>`; prompt(); ei = 0; }; reset();
    api.add(ts => { t0 ??= ts; let t = ts - t0; if (t > T) { t0 = ts; t = 0; reset(); }
      while (ei < ev.length && ev[ei][0] <= t) { const [, k, v] = ev[ei++]; if (k === "type") cur.textContent = v; else if (k === "enter") cur.parentNode.querySelector(".cu").remove(); else if (k === "out") o.insertAdjacentHTML("beforeend", `<div class="o">${v}</div>`); else prompt(); } });
  };

  /* ───── system ───── */
  P.system = (scr, api) => {
    scr.innerHTML = sb("09:42", 71) + hd("System") + `<div class="sy-n"><b class="D">0</b><span class="u">%</span></div>
      <div class="sy-s">${I.bolt}<div><b>Charging</b><small>Stops at 80%</small></div></div>
      <div class="sy-m"><canvas></canvas></div>
      ${W(24, 352, 152, 88, 1, "sy-t", `<i class="sw sm on"></i><b>Stay awake</b><small>While charging</small>`)}
      ${W(184, 352, 152, 88, 2, "sy-t", `<i class="sw sm on"></i><b>Charge limit</b><small>Stops at 80%</small>`)}
      ${W(24, 448, 152, 136, 3, "sy-slot act", `<span class="lab">Slot A · active</span><b class="D">0${PT}3${PT}1</b><small>Booted 3 days</small><i class="g D">A</i>`)}
      ${W(184, 448, 152, 136, 4, "sy-slot", `<span class="lab">Slot B · standby</span><b class="D">0${PT}3${PT}0</b><small>Rollback ready</small><i class="g D">B</i>`)}
      <div class="sy-btn w" style="--i:5">${I.sync}Check for update</div>
      ${W(24, 656, 312, 84, 6, "sy-dev", `<div class="h">${I.chip}<b>Redmi Note 10 Pro</b></div><div class="cells"><span><small>Codename</small>sweet</span><span><small>Kernel</small>7.1</span><span><small>Memory</small>8 GB</span></div>`)}` + HI;
    count(api, scr.querySelector(".sy-n b"), 71, 1300, 0, 200);
    const [x, w, h] = api.canvas(scr.querySelector(".sy-m canvas")), cols = 26, rows = 9, p = 12; let t0;
    api.add(ts => { t0 ??= ts; const t = ts - t0, f = .71 * eo((t - 200) / 1300) * cols, lim = Math.round(.8 * cols), wv = (t / 55) % (cols * 1.5);
      x.clearRect(0, 0, w, h);
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const k = cl(f - c), g = k ? Math.exp(-Math.pow((c - wv + Math.abs(r - 4) * .7) / 2.2, 2)) : 0, lm = c === lim, md = c < lim;
        D(x, p / 2 + c * p, p / 2 + r * p, lm ? (r % 2 ? 0 : 2.2) : 1.5 + k * (2.4 + g * 1), lm ? .9 : (md ? .3 : .16) + k * (.5 + g * .5)); }
      x.globalAlpha = 1; });
  };

  const css = `
.s-dot{background:#000;color:#fff;font:400 15px/1.3 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;--c:#131313;--l:#2a2a2a;--d:#a8a8a8;--r:${RED};letter-spacing:-.006em;font-feature-settings:"tnum","cv11"}
.s-dot *{box-sizing:border-box}
.s-dot b{font-weight:600}
.s-dot small{font-size:12.5px;color:var(--d);display:block}
.s-dot i{font-style:normal;display:block}
.s-dot canvas{display:block}
.s-dot .D{font-family:Doto,ui-monospace,monospace;font-weight:900;font-variation-settings:"ROND" 100;letter-spacing:0;line-height:.86;-webkit-text-stroke:calc(var(--k,.022)*1em) currentColor}
.s-dot .pt{display:inline-block;width:.13em;height:.13em;border-radius:50%;background:currentColor;margin:0 .07em}
.s-dot .col{display:grid;gap:.14em;width:.2em;justify-items:center;margin-bottom:.035em;animation:dot-blink 2s ease-in-out infinite}
.s-dot .col b{width:.105em;height:.105em;border-radius:50%;background:currentColor}
.s-dot .u{font-weight:600;font-size:20px;color:var(--d)}
.s-dot .ic{width:24px;height:24px;display:block;flex:none}
.s-dot .full{position:absolute;inset:0;width:360px;height:800px}
.s-dot .sb{position:absolute;top:0;left:0;right:0;height:44px;display:flex;justify-content:space-between;align-items:center;padding:4px 28px 0;font-weight:600;font-size:13px;z-index:5}
.s-dot .sb-r{display:flex;align-items:center;gap:6px}
.s-dot .dots{display:flex;gap:2.5px;align-items:center}
.s-dot .dots i{width:4px;height:4px;border-radius:50%;background:#fff}
.s-dot .dots i.o{opacity:.3}
.s-dot .bat{width:25px;height:12px;border-radius:4px;box-shadow:inset 0 0 0 1.25px #ffffffa0;padding:2.5px}
.s-dot .bat i{height:100%;border-radius:1.5px;background:#fff}
.s-dot .hi{position:absolute;left:124px;bottom:8px;width:112px;height:4px;border-radius:2px;background:#fff;opacity:.9}
.s-dot .hd{position:absolute;top:48px;left:24px;right:24px;height:44px;display:flex;align-items:center;gap:12px}
.s-dot .bk{width:40px;height:40px;border-radius:50%;background:var(--c);display:grid;place-items:center;flex:none;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .hd-t{font-size:30px;flex:1;white-space:nowrap;padding-top:1px;text-transform:uppercase;--k:.03}
.s-dot .hd-n{display:flex;align-items:baseline;gap:6px;font-size:12.5px;color:var(--d)}
.s-dot .hd-n b{font-size:30px;color:#fff;--k:.03}
.s-dot .lab{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--d);display:block;white-space:nowrap}
.s-dot .w{position:absolute;background:var(--c);border-radius:28px;animation:dot-in .85s cubic-bezier(.2,1.4,.36,1) both;animation-delay:calc(var(--i,0)*60ms)}
@keyframes dot-in{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:none}}
.s-dot .live{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#fff;transition:opacity .3s}
.s-dot .live.cut{opacity:.35}
.s-dot .ld{width:7px;height:7px;border-radius:50%;background:var(--r);flex:none;animation:dot-pulse 1.5s ease-out infinite}
@keyframes dot-pulse{0%{box-shadow:0 0 0 0 #ff3126aa}70%,100%{box-shadow:0 0 0 7px #ff312600}}
.s-dot .sw{width:48px;height:28px;border-radius:14px;box-shadow:inset 0 0 0 1.5px #555;position:relative;flex:none;transition:background .25s,box-shadow .25s}
.s-dot .sw::after{content:"";position:absolute;top:5px;left:5px;width:18px;height:18px;border-radius:50%;background:#8a8a8a;transition:transform .5s cubic-bezier(.3,1.6,.5,1),background .25s}
.s-dot .sw.on{background:#fff;box-shadow:inset 0 0 0 1.5px #fff}
.s-dot .sw.on::after{transform:translateX(20px);background:#000}
.s-dot .sw.big{width:96px;height:56px;border-radius:28px}
.s-dot .sw.big::after{width:40px;height:40px;top:8px;left:8px}
.s-dot .sw.big.on::after{transform:translateX(40px)}
.s-dot .sw.sm{width:40px;height:24px}
.s-dot .sw.sm::after{width:14px;height:14px}
.s-dot .sw.sm.on::after{transform:translateX(16px)}
.s-dot .ci{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none;box-shadow:inset 0 0 0 1px #3a3a3a}
.s-dot .march{height:6px;background:radial-gradient(circle,#fff 1.6px,transparent 2.1px) 0 50%/8px 6px repeat-x;animation:dot-march .5s linear infinite;-webkit-mask:linear-gradient(90deg,transparent,#000 40%,#000);mask:linear-gradient(90deg,transparent,#000 40%,#000)}
@keyframes dot-march{to{background-position-x:8px}}

.s-dot .bt-w{position:absolute;top:444px;left:0;right:0;text-align:center;font-size:54px;display:flex;justify-content:center;text-transform:uppercase}
.s-dot .bt-w span{display:block;opacity:0}
.s-dot .bt-s{position:absolute;left:48px;right:48px;top:690px;display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:var(--d)}
.s-dot .bt-p{font-size:28px;color:#fff;--k:.03}

.s-dot .lk-date{position:absolute;top:62px;left:0;right:0;text-align:center;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--d)}
.s-dot .lk-clock{position:absolute;top:88px;left:0;right:0;display:flex;justify-content:center;align-items:center;font-size:128px;height:116px;--k:.012}
@keyframes dot-blink{50%{opacity:.3}}
.s-dot .lk-live{display:flex;align-items:center;gap:14px;padding:0 20px 0 22px;border-radius:34px}
.s-dot .lk-live div{flex:1}
.s-dot .lk-live b{display:block;font-size:15px}
.s-dot .lk-live canvas{width:56px;height:32px}
.s-dot .lk-pin{position:absolute;top:322px;left:0;right:0;display:flex;justify-content:center;gap:18px}
.s-dot .lk-pin i{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1.5px #777;transition:transform .45s cubic-bezier(.3,1.8,.5,1),background .15s}
.s-dot .lk-pin i.on{background:#fff;box-shadow:inset 0 0 0 1.5px #fff;transform:scale(1.25)}
.s-dot .lk-pin.ok i{animation:dot-hop .7s cubic-bezier(.3,1.5,.5,1)}
.s-dot .lk-pin.ok i:nth-child(2){animation-delay:.07s}.s-dot .lk-pin.ok i:nth-child(3){animation-delay:.14s}.s-dot .lk-pin.ok i:nth-child(4){animation-delay:.21s}
@keyframes dot-hop{40%{transform:translateY(-12px) scale(1.25)}}
.s-dot .lk-pad{position:absolute;top:364px;left:42px;width:276px;display:grid;grid-template-columns:repeat(3,76px);gap:14px 24px}
.s-dot .k{width:76px;height:76px;border-radius:50%;background:var(--c);display:grid;place-items:center;font-size:44px;padding-bottom:3px;animation:dot-in .7s cubic-bezier(.2,1.4,.36,1) both;animation-delay:calc(var(--i)*28ms);transition:background .35s,color .35s,transform .5s cubic-bezier(.3,1.7,.5,1)}
.s-dot .k[data-k=x]{background:none}
.s-dot .k.hit{background:#fff;color:#000;transform:scale(.9);transition-duration:.05s}

.s-dot .su-step{position:absolute;top:58px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center}
.s-dot .su-seg{display:flex;gap:6px}
.s-dot .su-seg i{width:28px;height:6px;border-radius:3px;background:radial-gradient(circle,#666 1.5px,transparent 2px) 0 50%/7px 6px}
.s-dot .su-seg i.on{background:#fff}
.s-dot .su-t{position:absolute;top:90px;left:24px;font-size:44px;line-height:.98;text-transform:uppercase}
.s-dot .su-qr{display:grid;place-items:center;background:#0b0b0b}
.s-dot .su-qr canvas{width:248px;height:248px}
.s-dot .su-qr .cn{position:absolute;width:26px;height:26px;border:2px solid #fff;border-radius:3px}
.s-dot .su-qr .a{top:14px;left:14px;border-right:0;border-bottom:0;border-top-left-radius:16px}
.s-dot .su-qr .b{top:14px;right:14px;border-left:0;border-bottom:0;border-top-right-radius:16px}
.s-dot .su-qr .c{bottom:14px;left:14px;border-right:0;border-top:0;border-bottom-left-radius:16px}
.s-dot .su-qr .d{bottom:14px;right:14px;border-left:0;border-top:0;border-bottom-right-radius:16px}
.s-dot .su-cap{position:absolute;top:488px;left:40px;right:40px;text-align:center;font-size:14px;color:var(--d);line-height:1.35}
.s-dot .su-tile{padding:14px 12px 0 14px;border-radius:24px}
.s-dot .su-tile .lab{margin-top:12px}
.s-dot .su-tile b{display:block;font-size:16px;margin-top:3px}
.s-dot .su-tile small{display:flex;align-items:center;gap:3px;font-size:12px}
.s-dot .su-tile small .ic{width:14px;height:14px;stroke-width:2.2;color:#fff}
.s-dot .su-tile.nx{background:none;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .su-tile.nx b,.s-dot .su-tile.nx .ic{color:var(--d)}
.s-dot .su-tile .march{position:absolute;right:14px;top:23px;width:36px}
.s-dot .su-foot{position:absolute;top:706px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:8px;font-size:14px;color:var(--d)}
.s-dot .su-foot .ic{width:20px;height:20px}

.s-dot .hm-clock{position:absolute;top:56px;left:22px;font-size:118px;line-height:.86;display:grid}
.s-dot .hm-date{position:absolute;top:66px;left:212px;width:124px;font-size:17px;line-height:1.25;padding-left:4px}
.s-dot .hm-date b{display:block;font-size:17px}
.s-dot .hm-date span{color:var(--d)}
.s-dot .hm-bat{border-radius:50%}
.s-dot .hm-bat canvas{width:124px;height:124px}
.s-dot .hm-bat div{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
.s-dot .hm-bat b{font-size:46px}
.s-dot .hm-bat small{font-size:11px;margin-top:2px}
.s-dot .hm-live{display:flex;align-items:center;padding:0 20px 0 22px;gap:12px;border-radius:32px}
.s-dot .hm-live .tx{flex:1}
.s-dot .hm-live b{display:block;font-size:17px;margin-top:8px}
.s-dot .hm-live canvas{width:120px;height:72px}
.s-dot .hm-hr,.s-dot .hm-ses{padding:18px 18px 0;border-radius:32px}
.s-dot .hm-hr canvas{position:absolute;top:44px;right:18px;width:54px;height:50px}
.s-dot .n{display:flex;align-items:baseline;gap:5px}
.s-dot .n small{font-size:13px}
.s-dot .hm-hr .n{position:absolute;left:18px;bottom:18px}
.s-dot .hm-hr .n b{font-size:46px}
.s-dot .hm-ses .n{margin-top:8px}
.s-dot .hm-ses .n b{font-size:46px}
.s-dot .hm-ses ul{list-style:none;position:absolute;left:18px;right:18px;bottom:16px;display:grid;gap:5px;font-size:13.5px;font-weight:500}
.s-dot .hm-ses li{display:flex;align-items:center;gap:8px}
.s-dot .hm-ses .march{width:34px}
.s-dot .hm-pill{display:flex;align-items:center;gap:10px;padding:0 10px 0 18px;border-radius:36px}
.s-dot .hm-pill b{display:block;font-size:14.5px}
.s-dot .hm-pill small{font-size:11.5px;white-space:nowrap}
.s-dot .hm-dock{position:absolute;top:648px;left:24px;right:24px;display:flex;justify-content:space-between;padding:0 22px}
.s-dot .app{display:grid;justify-items:center;gap:8px;font-size:12.5px;font-weight:500;animation:dot-in .85s cubic-bezier(.2,1.4,.36,1) both;animation-delay:calc(var(--i)*60ms)}
.s-dot .app i{width:68px;height:68px;border-radius:50%;background:var(--c);display:grid;place-items:center;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .app i.pri{background:#fff;color:#000;box-shadow:none}
.s-dot .app .ic{width:28px;height:28px}

.s-dot .qk-top{position:absolute;top:56px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:flex-end}
.s-dot .qk-top .D{font-size:54px;display:flex;align-items:center;height:44px}
.s-dot .qk-top>span{color:var(--d);font-size:15px;padding-bottom:2px}
.s-dot .qk-tile{padding:16px;border-radius:30px;transition:background .3s,color .3s}
.s-dot .qk-tile .ci{box-shadow:inset 0 0 0 1px #444;transition:transform .6s cubic-bezier(.3,1.8,.5,1)}
.s-dot .qk-tile .st{position:absolute;top:22px;right:20px;width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px #777}
.s-dot .qk-tile b{display:block;font-size:15px;margin-top:9px;line-height:1.2}
.s-dot .qk-tile.on{background:#fff;color:#000}
.s-dot .qk-tile.on small{color:#4a4a4a}
.s-dot .qk-tile.on .ci{background:#000;color:#fff;box-shadow:none;transform:rotate(0.001deg) scale(1)}
.s-dot .qk-tile.on .st{background:#000;box-shadow:none}
.s-dot .qk-tile.hs.on .ci{animation:dot-pop .6s cubic-bezier(.3,1.8,.5,1)}
@keyframes dot-pop{0%{transform:scale(.7)}}
.s-dot .qk-row{position:absolute;top:356px;left:24px;right:24px;display:grid;grid-template-columns:repeat(3,1fr);text-align:center}
.s-dot .qk-r{display:grid;justify-items:center;animation:dot-in .85s cubic-bezier(.2,1.4,.36,1) both;animation-delay:calc(var(--i)*60ms)}
.s-dot .qk-r i{width:72px;height:72px;border-radius:50%;background:var(--c);display:grid;place-items:center;margin-bottom:8px;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .qk-r.on i{background:#fff;color:#000;box-shadow:none}
.s-dot .qk-r b{font-size:13px}
.s-dot .qk-r small{font-size:11.5px}
.s-dot .qk-br{display:flex;align-items:center;gap:14px;padding:0 22px;border-radius:36px}
.s-dot .qk-br canvas{flex:1;height:24px;width:230px}
.s-dot .qk-bat{padding:20px 22px;border-radius:32px}
.s-dot .qk-bat .n{position:absolute;left:22px;top:22px}
.s-dot .qk-bat .n b{font-size:64px}
.s-dot .qk-bat .u{font-size:24px}
.s-dot .qk-bat .t{position:absolute;right:22px;top:24px;text-align:right}
.s-dot .qk-bat .t b{display:block;font-size:15px;margin-top:6px}
.s-dot .qk-bat canvas{position:absolute;left:22px;bottom:20px;width:268px;height:34px}
.s-dot .qk-grab{position:absolute;left:156px;bottom:40px;width:48px;height:5px;border-radius:3px;background:#5a5a5a}

.s-dot .nb-radar{position:absolute;top:96px;left:0;width:360px;height:336px}
.s-dot .nb-radar canvas{width:360px;height:336px}
.s-dot .nb-l{position:absolute;transform:translate(-50%,20px);text-align:center;white-space:nowrap;padding:3px 9px 4px;border-radius:12px;background:#000000d9;line-height:1.25;animation:dot-fade .6s both;animation-delay:calc(1s + var(--i)*220ms)}
.s-dot .nb-l.up{transform:translate(-50%,calc(-100% - 20px))}
@keyframes dot-fade{from{opacity:0}}
.s-dot .nb-l b{font-size:12.5px;display:block;text-shadow:0 0 6px #000,0 0 6px #000,0 0 3px #000}
.s-dot .nb-l small{font-size:11px;text-shadow:0 0 6px #000,0 0 6px #000,0 0 3px #000;color:#b4b4b4}
.s-dot .nb-c{padding:14px 14px 0 16px;border-radius:26px}
.s-dot .nb-c .h{display:flex;justify-content:space-between;align-items:center;height:24px}
.s-dot .nb-c b{display:block;font-size:14.5px;margin-top:7px;white-space:nowrap}
.s-dot .nb-c small{font-size:11.5px;white-space:nowrap;line-height:1.35}
.s-dot .nb-c small span{display:inline}
.s-dot .nb-c .f{color:#fff}
.s-dot .nb-raw{display:flex;align-items:center;gap:10px;padding:0 18px 0 14px;border-radius:38px}
.s-dot .nb-raw div{flex:1}
.s-dot .nb-raw b{display:block;font-size:15px}
.s-dot .nb-raw small{font-size:11.5px;white-space:nowrap}

.s-dot .dv-sub{position:absolute;top:98px;left:24px;right:24px;display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--d)}
.s-dot .dv-g{position:absolute;top:122px;left:24px;width:312px;height:214px}
.s-dot .dv-g canvas{width:312px;height:214px}
.s-dot .dv-g .c{position:absolute;left:0;right:0;top:74px;text-align:center}
.s-dot .dv-g b{font-size:92px;display:block}
.s-dot .dv-g .lab{margin-top:8px;letter-spacing:.2em;padding-left:.2em}
.s-dot .dv-m{padding:14px 18px;border-radius:28px}
.s-dot .dv-m div{display:flex;align-items:baseline;gap:5px;margin-top:6px}
.s-dot .dv-m b{font-size:40px;--k:.03}
.s-dot .dv-bt{position:absolute;right:20px;top:36px;width:12px;height:12px;border-radius:50%;background:#fff}
.s-dot .dv-sp{position:absolute;right:16px;top:32px;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 50% 2.5px,#fff 2.5px,transparent 3px),radial-gradient(circle at 50% 17.5px,#666 2px,transparent 2.5px),radial-gradient(circle at 2.5px 50%,#666 2px,transparent 2.5px),radial-gradient(circle at 17.5px 50%,#666 2px,transparent 2.5px)}
.s-dot .dv-ch{padding:16px 0 0;overflow:hidden}
.s-dot .dv-ch .h{display:flex;justify-content:space-between;padding:0 20px}
.s-dot .dv-ch canvas{width:280px;height:80px;margin:12px 0 0 16px}
.s-dot .dv-log{overflow:hidden;padding:12px 18px;font:500 11.5px/19px ui-monospace,"SF Mono",Menlo,"DejaVu Sans Mono",monospace;color:#bdbdbd;white-space:pre;-webkit-mask:linear-gradient(transparent,#000 22%,#000 82%,transparent);mask:linear-gradient(transparent,#000 22%,#000 82%,transparent)}
.s-dot .dv-log span{color:#8c8c8c}
.s-dot .dv-log i{display:inline;color:#fff}
.s-dot .dv-btn{left:24px;top:680px;width:312px;height:56px;border-radius:28px;background:none;box-shadow:inset 0 0 0 1.5px #fff;display:grid;place-items:center;font-size:16px;font-weight:600}

.s-dot .ac-hero{padding:18px 22px 0;border-radius:32px}
.s-dot .ac-hero .h,.s-dot .ac-ses .h{display:flex;justify-content:space-between}
.s-dot .ac-hero canvas{width:268px;height:56px;margin-top:10px}
.s-dot .ac-hero .r{display:flex;justify-content:space-between;align-items:center;margin-top:12px;height:60px}
.s-dot .ac-hero .r b{font-size:76px;padding-top:4px}
.s-dot .ac-hero p{margin-top:12px;font-size:13px;color:var(--d);line-height:1.4}
.s-dot .ac-hero p b{color:#fff;font-size:15px}
.s-dot .ac-ch{padding:14px 12px 0 14px;border-radius:24px;transition:opacity .3s}
.s-dot .ac-ch b{display:block;font-size:15px;margin-top:8px}
.s-dot .ac-ch small{font-size:11.5px;line-height:1.3;margin-top:1px}
.s-dot .ac-ch .sw{position:absolute;right:12px;top:14px}
.s-dot .ac-ch.na{background:none;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .ac-ch.na b,.s-dot .ac-ch.na .ic{color:var(--d)}
.s-dot .ac-ses{padding:18px 22px 0;border-radius:32px}
.s-dot .ac-ses .row{display:flex;justify-content:space-between;align-items:center;height:68px;border-top:1px solid var(--l)}
.s-dot .ac-ses .h{padding-bottom:13px}
.s-dot .ac-ses .row b{font-size:15.5px;display:block}
.s-dot .ac-ses em{font-style:normal;font-weight:400;color:var(--d)}
.s-dot .ac-ses .cl{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--d)}

.s-dot .nw-hero{padding:20px 22px;border-radius:32px}
.s-dot .nw-hero .n{margin-top:14px}
.s-dot .nw-hero .n b{font-size:84px;--k:.016}
.s-dot .nw-hero .u{font-size:18px}
.s-dot .nw-hero p{position:absolute;left:22px;bottom:20px;font-size:13.5px;color:var(--d);line-height:1.4}
.s-dot .nw-hero p b{color:#fff}
.s-dot .nw-hero canvas{position:absolute;right:20px;top:54px;width:120px;height:120px}
.s-dot .nw-p{display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 20px;border-radius:34px}
.s-dot .nw-p b,.s-dot .sy-t b{display:block;font-size:14.5px}
.s-dot .sy-t{padding:14px 16px 0 18px;border-radius:30px}
.s-dot .sy-t b{margin-top:9px}
.s-dot .nw-wifi{padding:18px 22px 0;border-radius:32px}
.s-dot .nw-wifi .row{display:flex;align-items:center;gap:14px;height:54px}
.s-dot .nw-wifi .row:nth-of-type(1){margin-top:6px;border-bottom:1px solid var(--l)}
.s-dot .nw-wifi .row div{flex:1}
.s-dot .nw-wifi .row b{display:block;font-size:15px}
.s-dot .nw-wifi .dm .ic{color:var(--d)}
.s-dot .nw-wifi .dots i{width:6px;height:6px}
.s-dot .nw-wifi .dots{gap:4px}
.s-dot .nw-ts{border-radius:32px}
.s-dot .nw-ts canvas{position:absolute;left:10px;top:8px;width:132px;height:132px}
.s-dot .nw-ts .t{position:absolute;left:156px;top:30px}
.s-dot .nw-ts .t b{display:block;font-size:36px;margin:10px 0 8px;--k:.03}
.s-dot .nw-ts .t small{font-size:14px}
.s-dot .nw-ts code{position:absolute;left:16px;right:16px;bottom:16px;height:36px;border-radius:18px;box-shadow:inset 0 0 0 1px var(--l);display:grid;place-items:center;font:500 12.5px ui-monospace,"SF Mono",Menlo,"DejaVu Sans Mono",monospace;color:#d0d0d0}

.s-dot .tm-b{border-radius:32px}
.s-dot .tm-b .bk{position:absolute;left:16px;top:16px;background:none}
.s-dot .tm-b .t{position:absolute;left:70px;top:17px}
.s-dot .tm-b .t b{font-size:32px;display:block;--k:.03}
.s-dot .tm-b .t small{font-size:11.5px;margin-top:5px}
.s-dot .tm-b canvas{position:absolute;left:68px;bottom:18px;width:224px;height:32px}
.s-dot .tm-b .ld1{position:absolute;left:22px;bottom:19px}
.s-dot .tm-o{position:absolute;top:200px;left:24px;right:12px;bottom:92px;font:500 13px/25px ui-monospace,"SF Mono",Menlo,"DejaVu Sans Mono",monospace;white-space:pre;overflow:hidden;color:#cfcfcf}
.s-dot .tm-o .c{color:#fff}
.s-dot .tm-o .p{font-weight:700}
.s-dot .tm-o .dm{color:#8c8c8c}
.s-dot .tm-o .o{animation:dot-fade .25s both}
.s-dot .tm-o .cu{display:inline-block;width:8px;height:15px;background:#fff;vertical-align:-3px;margin-left:1px;animation:dot-blink 1s steps(1) infinite}
.s-dot .tm-k{position:absolute;left:12px;right:12px;bottom:28px;display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.s-dot .tm-k span{height:44px;border-radius:22px;background:var(--c);display:grid;place-items:center;font-size:12.5px;font-weight:600;box-shadow:inset 0 0 0 1px var(--l)}
.s-dot .tm-k .ic{width:18px;height:18px}

.s-dot .sy-n{position:absolute;top:104px;left:22px;display:flex;align-items:baseline;gap:6px}
.s-dot .sy-n b{font-size:112px;--k:.012}
.s-dot .sy-n .u{font-size:30px}
.s-dot .sy-s{position:absolute;top:142px;right:24px;display:flex;gap:8px;align-items:center}
.s-dot .sy-s b{display:block;font-size:15px}
.s-dot .sy-m{position:absolute;top:224px;left:24px}
.s-dot .sy-m canvas{width:312px;height:108px}
.s-dot .sy-slot{padding:18px 18px 0;border-radius:32px;overflow:hidden}
.s-dot .sy-slot b{display:block;font-size:36px;margin-top:14px;--k:.03}
.s-dot .sy-slot small{margin-top:8px}
.s-dot .sy-slot .g{position:absolute;right:12px;bottom:8px;font-size:48px;opacity:.16}
.s-dot .sy-slot.act{background:#fff;color:#000}
.s-dot .sy-slot.act .lab,.s-dot .sy-slot.act small{color:#444}
.s-dot .sy-btn{left:24px;top:592px;width:312px;height:56px;border-radius:28px;background:none;box-shadow:inset 0 0 0 1.5px #fff;display:flex;justify-content:center;align-items:center;gap:10px;font-size:16px;font-weight:600}
.s-dot .sy-btn .ic{width:20px;height:20px}
.s-dot .sy-dev{padding:14px 20px 0;border-radius:28px}
.s-dot .sy-dev .h{display:flex;align-items:center;gap:10px;font-size:15px}
.s-dot .sy-dev .cells{display:grid;grid-template-columns:repeat(3,1fr);margin-top:8px;font-size:14px;font-weight:500}
.s-dot .sy-dev .cells small{font-size:11px}
`;

  return {
    id: "dot", name: "Dot",
    cap: "<b>Dot.</b> Black, white and one red dot that only ever means live; big numbers are set in a dot-matrix typeface and every screen is built from round and pill widgets. Dots assemble, ripple and count up, loaders march, and widgets settle with a spring.",
    css,
    render(scr, page, api) { (P[page] || P.home)(scr, api); },
  };
})());
