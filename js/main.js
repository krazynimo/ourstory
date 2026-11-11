(() => {
  "use strict";
  const S = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:)?\/\//i.test(u || "") || /^[\w./-]+$/.test(u || "") ? u : "#");
  const pad = (n) => String(n).padStart(2, "0");
  const names = S.names || ["", ""];
  const IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>';

  /* ---------- reveal on scroll (opt-in, content visible without it) ---------- */
  const canAnim = !reduce && "IntersectionObserver" in window;
  if (canAnim) root.classList.add("anim");
  const seen = canAnim ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  const watch = (scope) => { if (seen) $$(".rv", scope).forEach((el) => seen.observe(el)); };

  /* ---------- hero ---------- */
  $("#heroPre").textContent = S.preTitle || "";
  $("#tagline").textContent = S.tagline || "";
  $("#navMark").textContent = `${(names[0] || "")[0] || ""} & ${(names[1] || "")[0] || ""}`;
  $("#ticketName").textContent = `${names[0]} & ${names[1]}: the full story`;
  if (S.hero) $("#heroPhoto").style.backgroundImage = `url("${safeUrl(S.hero)}")`;
  let i = 0;
  const word = (w) => `<span class="word" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`;
  const t = $("#heroTitle");
  t.setAttribute("aria-label", `${names[0]} and ${names[1]}`);
  t.innerHTML = `${word(names[0])}<span class="amp" aria-hidden="true">&amp;</span>${word(names[1])}`;

  if (!reduce) {
    root.classList.add("intro");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("open")));
  }

  // "Married for" running time
  const wd = S.weddingDate ? new Date(S.weddingDate + "T00:00:00") : null;
  if (wd && !isNaN(wd) && wd < new Date()) {
    const cells = $("#tcCells");
    const units = ["years", "days", "hours", "min", "sec"];
    cells.innerHTML = units.map((u) => `<div class="tc-cell"><b>00</b><i>${u}</i></div>`).join("");
    const out = $$("b", cells);
    const tick = () => {
      const now = new Date();
      let y = now.getFullYear() - wd.getFullYear();
      let anniv = new Date(wd); anniv.setFullYear(wd.getFullYear() + y);
      if (anniv > now) { y--; anniv = new Date(wd); anniv.setFullYear(wd.getFullYear() + y); }
      let s = Math.floor((now - anniv) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      [pad(y), String(d).padStart(3, "0"), pad(h), pad(m), pad(s)].forEach((v, k) => { if (out[k].textContent !== v) out[k].textContent = v; });
    };
    tick(); setInterval(tick, 1000);
    $("#timecode").hidden = false;
  }

  // film grain texture
  try {
    const g = document.createElement("canvas"); g.width = g.height = 160;
    const gx = g.getContext("2d"), im = gx.createImageData(160, 160);
    for (let p = 0; p < im.data.length; p += 4) { const v = Math.random() * 255; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; }
    gx.putImageData(im, 0, 0);
    $(".grain").style.backgroundImage = `url(${g.toDataURL()})`;
  } catch (e) { /* no grain, no problem */ }

  // drifting gold dust in the projector beam
  (() => {
    const c = $("#dust"); if (!c || reduce) return;
    const x = c.getContext("2d"); let w, h, dpr, bits = [], on = true;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const mk = () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.6 + Math.random() * 2.6, vy: -(0.08 + Math.random() * 0.3), vx: (Math.random() - 0.5) * 0.18, a: 0.15 + Math.random() * 0.55, ph: Math.random() * 6.28 });
    size(); bits = Array.from({ length: Math.round(Math.min(90, w / 14)) }, mk);
    addEventListener("resize", size);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) requestAnimationFrame(draw); }).observe(c);
    function draw(tm) {
      if (!on) return;
      x.clearRect(0, 0, w, h);
      for (const b of bits) {
        b.x += b.vx + Math.sin(tm / 1800 + b.ph) * 0.12; b.y += b.vy;
        if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w; }
        const tw = b.a * (0.6 + 0.4 * Math.sin(tm / 900 + b.ph));
        const gr = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3);
        gr.addColorStop(0, `rgba(240,219,166,${tw})`); gr.addColorStop(1, "rgba(240,219,166,0)");
        x.fillStyle = gr; x.beginPath(); x.arc(b.x, b.y, b.r * 3, 0, 6.29); x.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ---------- starring ---------- */
  $("#leads").innerHTML = (S.people || []).map((p) => `
    <article class="lead rv">
      <div class="lead-photo wipe"><img src="${esc(safeUrl(p.photo))}" alt="${esc(p.name)}" loading="lazy"></div>
      <h3 class="lead-name">${esc(p.name)}</h3>
      <p class="lead-line">${esc(p.line)}</p>
      ${p.instagram ? `<a class="ig" href="${esc(safeUrl(p.instagram.url))}" target="_blank" rel="noopener">${IG}<span>${esc(p.instagram.handle)}</span></a>` : ""}
      ${p.posts && p.posts.length ? `<div class="posts">${p.posts.map((o, k) => `<a href="${esc(safeUrl(o.url))}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on Instagram, post ${k + 1}"><img src="${esc(safeUrl(o.img))}" alt="" loading="lazy"></a>`).join("")}</div>` : ""}
    </article>`).join("");

  /* ---------- film strip ---------- */
  $("#stillsLede").textContent = S.stillsLede || "";
  const stills = S.stills || [];
  if (stills.length) {
    const run = (hide) => stills.map((src, k) => `<div class="frame"${hide ? ' aria-hidden="true"' : ""}><img src="${esc(safeUrl(src))}" alt="${hide ? "" : "Photo " + (k + 1)}" loading="lazy"><span>${pad(k + 1)}A</span></div>`).join("");
    $("#strip").innerHTML = `<div class="strip-track">${run(false)}${run(true)}</div>`;
  } else $("#stills").hidden = true;

  /* ---------- credits ---------- */
  $("#fin").textContent = S.fin || "";
  $("#billing").innerHTML = (S.credits || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#footNote").textContent = S.footNote || "";

  /* ---------- nav ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("solid", scrollY > innerHeight * 0.6);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  watch(document);

  /* =====================================================================
     THE FEATURE: password-locked content.
     Everything in /locked is AES-256-GCM encrypted by tools/lock.mjs.
     The password never leaves this browser; it only derives the key.
  ====================================================================== */
  const gate = $("#gate"), msg = $("#gateMsg"), btn = $("#gateBtn"), vault = $("#vault"), gateWrap = $("#gateWrap");
  const KEY = "nm-pass";
  let key = null, meta = null, shots = [];
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function derive(pw) {
    if (!meta) { const r = await fetch("locked/meta.json", { cache: "no-store" }); if (!r.ok) throw new Error("missing"); meta = await r.json(); }
    const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(meta.salt), iterations: meta.iterations, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  }
  async function open(k, file) {
    const r = await fetch("locked/" + file); if (!r.ok) throw new Error("missing");
    const buf = new Uint8Array(await r.arrayBuffer());
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, k, buf.slice(12));
  }

  // decrypt pictures only as they come into view
  const urls = new Map();
  async function picUrl(pic) {
    if (!urls.has(pic.f)) urls.set(pic.f, open(key, pic.f).then((b) => URL.createObjectURL(new Blob([b], { type: pic.t }))));
    return urls.get(pic.f);
  }
  const lazy = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { lazy.unobserve(e.target); fill(e.target); }
  }), { rootMargin: "600px 0px" }) : null;
  function fill(img) {
    picUrl(JSON.parse(img.dataset.enc)).then((u) => { img.onload = () => { img.classList.add("ready"); img.style.aspectRatio = ""; }; img.src = u; }).catch(() => {});
  }
  const encImg = (pic, alt) => pic ? `<img data-enc='${esc(JSON.stringify({ f: pic.f, t: pic.t }))}' alt="${esc(alt || "")}"${pic.w && pic.h ? ` style="aspect-ratio:${+pic.w}/${+pic.h}"` : ""}>` : "";

  function renderVault(c) {
    const j = c.journey || [], w = c.wedding || {}, hl = c.highlights || [];
    shots = w.photos || [];
    vault.innerHTML = `
      ${j.length ? `<section class="wrap" id="journey"><h2 class="h-sec">Our journey</h2>
        <div class="journey" id="journeyLine">${j.map((s, k) => `
          <article class="scene rv">
            <div class="scene-pic wipe">${encImg(s.photo, s.title)}</div>
            <div class="scene-txt"><span class="scene-no" aria-hidden="true">${pad(k + 1)}</span>
              <span class="scene-date">${esc(s.date)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
          </article>`).join("")}</div></section>` : ""}
      ${shots.length ? `<section class="wrap" id="wedding"><h2 class="h-sec">${esc(w.title || "The wedding")}</h2>
        ${w.intro ? `<p class="lede">${esc(w.intro)}</p>` : ""}
        ${w.date || w.place ? `<p class="wed-meta">${esc([w.date, w.place].filter(Boolean).join("  /  "))}</p>` : ""}
        <div class="wall">${shots.map((p, k) => `<button class="shot rv" type="button" data-k="${k}" aria-label="Open photo ${k + 1}">${encImg(p.photo, p.caption)}</button>`).join("")}</div></section>` : ""}
      ${hl.length ? `<section class="wrap" id="highlights"><h2 class="h-sec">Highlights</h2>
        <div class="reels">${hl.map((r) => `<a class="reel rv" href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener">
          <div class="reel-pic">${encImg(r.thumb, "")}</div><h3>${esc(r.title)}</h3><span>${esc(r.note)}</span></a>`).join("")}</div></section>` : ""}
      <div class="wrap"><button class="relock" type="button" id="relock">Lock the film again</button></div>`;
    $$("img[data-enc]", vault).forEach((im) => (lazy ? lazy.observe(im) : fill(im)));
    watch(vault);
    $("#relock").onclick = () => { try { sessionStorage.removeItem(KEY); } catch (e) {} location.reload(); };
    const line = $("#journeyLine");
    if (line) {
      const prog = () => { const r = line.getBoundingClientRect(); line.style.setProperty("--p", Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height)).toFixed(4)); };
      addEventListener("scroll", prog, { passive: true }); prog();
    }
  }

  async function unlock(pw, quiet) {
    btn.disabled = true; msg.textContent = "";
    try {
      const k = await derive(pw);
      const content = JSON.parse(new TextDecoder().decode(await open(k, meta.content)));
      key = k;
      try { sessionStorage.setItem(KEY, pw); } catch (e) {}
      renderVault(content);
      const show = () => { gateWrap.hidden = true; vault.hidden = false; if (!quiet) vault.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
      if (quiet || reduce) show(); else { gate.classList.add("torn"); setTimeout(show, 850); }
    } catch (err) {
      if (quiet) { try { sessionStorage.removeItem(KEY); } catch (e) {} }
      else if (err && err.message === "missing") msg.textContent = "The film isn't loaded on this site yet. Run tools/lock.mjs and push again.";
      else if (!(window.crypto && crypto.subtle)) msg.textContent = "This page must be opened over https (or localhost) to unlock.";
      else { msg.textContent = `That password didn't work. Check with ${names[0]} or ${names[1]}.`; gate.classList.remove("shake"); void gate.offsetWidth; gate.classList.add("shake"); $("#pw").select(); }
    } finally { btn.disabled = false; }
  }
  gate.addEventListener("submit", (e) => { e.preventDefault(); const pw = $("#pw").value; if (pw) unlock(pw, false); });
  try { const saved = sessionStorage.getItem(KEY); if (saved) unlock(saved, true); } catch (e) {}

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount");
  let cur = 0, lastFocus = null;
  async function showShot(k) {
    cur = (k + shots.length) % shots.length;
    const p = shots[cur];
    lbCap.textContent = p.caption || ""; lbCount.textContent = `${cur + 1} / ${shots.length}`;
    lbImg.alt = p.caption || `Photo ${cur + 1}`;
    lbImg.src = await picUrl(p.photo);
  }
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  vault.addEventListener("click", (e) => {
    const s = e.target.closest(".shot"); if (!s) return;
    lastFocus = s; lb.hidden = false; document.body.style.overflow = "hidden"; showShot(+s.dataset.k); $("#lbClose").focus();
  });
  $("#lbClose").onclick = closeLb;
  $("#lbPrev").onclick = () => showShot(cur - 1);
  $("#lbNext").onclick = () => showShot(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") showShot(cur - 1); else if (e.key === "ArrowRight") showShot(cur + 1);
  });
  let sx = null;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) showShot(cur + (dx < 0 ? 1 : -1)); });
})();
