(() => {
  "use strict";
  const S = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  // Devices set to "reduce motion" get the calm version, with a button to play the full one.
  let motionPref = null; try { motionPref = localStorage.getItem("nm-motion"); } catch (e) {}
  const motion = !!(G && ST) && (!reduce || motionPref === "on");
  root.classList.add(motion ? "motion" : "static");
  if (motion) { G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); G.defaults({ ease: "expo.out", duration: 1.2 }); }

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") || /^[\w./-]+$/.test(u || "") ? u : "#");
  const pad = (n) => String(n).padStart(2, "0");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const names = S.names || ["", ""];
  const IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>';
  const wd = S.weddingDate ? new Date(S.weddingDate + "T00:00:00") : null;
  const wdOk = wd && !isNaN(wd);
  const wdText = wdOk ? wd.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

  // split text into masked characters
  const split = (el, text) => {
    el.setAttribute("aria-label", text);
    el.innerHTML = String(text).split(" ").map((w) => `<span class="sw" aria-hidden="true">${[...w].map((c) => `<span class="sc">${esc(c)}</span>`).join("")}</span>`).join(" ");
    return $$(".sc", el);
  };

  /* =============================== build the page =============================== */
  $("#heroPre").textContent = S.preTitle || "";
  $("#tagline").textContent = S.tagline || "";
  $("#navMark").textContent = `${(names[0] || "")[0] || ""} & ${(names[1] || "")[0] || ""}`;
  $("#ticketName").textContent = `${names[0]} & ${names[1]}: the full story`;
  $("#ldCap").textContent = `${names[0]} & ${names[1]}`;
  if (S.hero) $("#heroPhoto").style.backgroundImage = `url("${safeUrl(S.hero)}")`;
  const word = (w, cls) => `<span class="word ${cls}" aria-hidden="true">${[...w].map((c) => `<span class="ch">${esc(c)}</span>`).join("")}</span>`;
  const title = $("#heroTitle");
  title.setAttribute("aria-label", `${names[0]} and ${names[1]}`);
  title.innerHTML = `${word(names[0], "w-a")}<span class="amp" aria-hidden="true">&amp;</span>${word(names[1], "w-b")}`;
  $("#since").innerHTML = wdOk ? `<small>Since</small><strong>${esc(wdText)}</strong>${S.place ? `<small>${esc(S.place)}</small>` : ""}` : "";

  // running time since the wedding
  if (wdOk && wd < new Date()) {
    const cells = $("#tcCells");
    cells.innerHTML = ["years", "days", "hours", "min", "sec"].map((u) => `<div class="tc-cell"><b>00</b><i>${u}</i></div>`).join("");
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

  // marquee
  const mqBits = [`${names[0]} & ${names[1]}`, wdText, S.place].filter(Boolean);
  const mqRun = mqBits.map((t) => `<span>${esc(t)}<b>&#10022;</b></span>`).join("");
  $("#marquee").innerHTML = `<div class="mq-track">${mqRun.repeat(8)}</div>`;

  // starring
  $("#leads").innerHTML = (S.people || []).map((p, k) => `
    <article class="lead">
      <div class="lead-photo mask" data-tilt><div class="par"><img src="${esc(safeUrl(p.photo))}" alt="${esc(p.name)}"></div></div>
      <div class="lead-txt">
        <span class="lead-role" data-rv>${k === 0 ? "The groom" : "The bride"}</span>
        <h3 class="lead-name" data-rv>${esc(p.name)}</h3>
        <p class="lead-line" data-rv>${esc(p.line)}</p>
        ${p.instagram ? `<a class="ig" data-rv data-mag href="${esc(safeUrl(p.instagram.url))}" target="_blank" rel="noopener">${IG}<span>${esc(p.instagram.handle)}</span></a>` : ""}
        ${p.posts && p.posts.length ? `<div class="posts" data-rv>${p.posts.map((o, n) => `<a href="${esc(safeUrl(o.url))}" target="_blank" rel="noopener" data-cur="Open" aria-label="${esc(p.name)} on Instagram, post ${n + 1}"><img src="${esc(safeUrl(o.img))}" alt="" loading="lazy"></a>`).join("")}</div>` : ""}
      </div>
    </article>`).join("");

  // stills reel
  const stills = S.stills || [];
  if (stills.length) {
    $("#strip").innerHTML = `
      <div class="st-intro"><h2 class="h-sec">Stills</h2><p class="lede">${esc(S.stillsLede || "")}</p><span class="st-hint">${fine ? "Keep scrolling" : "Swipe"}</span></div>
      ${stills.map((src, k) => `<figure class="frame"><div class="mask"><img src="${esc(safeUrl(src))}" alt="Photo ${k + 1}" loading="lazy"></div><figcaption>${pad(k + 1)}A</figcaption></figure>`).join("")}
      <div class="st-end">The rest is in <a href="#film">the feature</a>.</div>`;
  } else $("#stills").hidden = true;

  // credits
  const finChars = split($("#fin"), S.fin || "");
  $("#billing").innerHTML = (S.credits || []).map(([k, v]) => `<div data-rv><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#footNote").textContent = S.footNote || "";

  // chapters rail
  const chapEls = $$("[data-chapter]");
  $("#chapters").innerHTML = chapEls.map((el) => `<a href="#${el.id}"><span>${esc(el.dataset.chapter)}</span><i></i></a>`).join("");
  const chapLinks = $$("#chapters a");

  // film grain
  try {
    const g = document.createElement("canvas"); g.width = g.height = 160;
    const gx = g.getContext("2d"), im = gx.createImageData(160, 160);
    for (let p = 0; p < im.data.length; p += 4) { const v = Math.random() * 255; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; }
    gx.putImageData(im, 0, 0);
    $(".grain").style.backgroundImage = `url(${g.toDataURL()})`;
  } catch (e) { /* optional */ }

  if (reduce && G && ST) {
    const b = document.createElement("button");
    b.className = "motion-toggle"; b.type = "button";
    b.textContent = motion ? "Switch to the calm version" : "Play the full experience";
    b.onclick = () => { try { localStorage.setItem("nm-motion", motion ? "off" : "on"); } catch (e) {} scrollTo(0, 0); location.reload(); };
    (motion ? $(".credits .wrap") : document.body).appendChild(b);
    if (!motion) b.classList.add("float");
  }

  /* =============================== smooth scroll =============================== */
  let lenis = null;
  if (motion && window.Lenis) {
    try {
      history.scrollRestoration = "manual"; scrollTo(0, 0);
      lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
      lenis.on("scroll", ST.update);
      G.ticker.add((t) => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
      lenis.stop();
    } catch (e) { lenis = null; }
  }
  const goTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else (typeof target === "string" ? $(target) : target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2) return;
    const t = $(a.getAttribute("href")); if (!t) return;
    e.preventDefault(); goTo(t);
  });
  const lockScroll = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? "hidden" : ""; };

  /* =============================== hero: live photograph (WebGL) =============================== */
  const gl = (() => {
    const c = $("#gl"); if (!motion || !S.hero) return null;
    const g = c.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); if (!g) return null;
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const fs = `precision highp float;
      uniform sampler2D uT; uniform vec2 uR, uI, uM; uniform float uTime, uP, uF; varying vec2 v;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
      void main(){
        vec2 uv = v; float rs = uR.x/uR.y, ri = uI.x/uI.y;
        vec2 s = rs < ri ? vec2(rs/ri, 1.) : vec2(1., ri/rs);
        s *= .93 - .015*sin(uTime*.11) - uP*.1;
        vec2 c = vec2(clamp(uF, s.x*.5, 1.-s.x*.5), .5);
        vec2 p = (uv-.5)*s + c;
        p += (vec2(noise(uv*3.+uTime*.06), noise(uv*3.+7.3-uTime*.05))-.5)*.007;
        vec2 d = uv-uM; d.x *= rs; float l = exp(-dot(d,d)*7.);
        p -= (uM-.5)*.014 + d*l*.035;
        vec2 dir = uv-.5; float ca = (.002 + uP*.012)*length(dir) + l*.002;
        vec3 col = vec3(texture2D(uT, p+dir*ca).r, texture2D(uT, p).g, texture2D(uT, p-dir*ca).b);
        float leak = smoothstep(.6, 0., distance(uv, vec2(.12+.1*sin(uTime*.09), .9+.06*cos(uTime*.12))));
        col += vec3(1., .7, .36)*leak*.2*(1.-uP);
        float lum = dot(col, vec3(.299,.587,.114));
        col = mix(col, col*vec3(1.08,1.,.88), smoothstep(.25,.9,lum));
        float vg = smoothstep(1.1, .2, length((uv-.5)*vec2(1.,1.2)));
        col *= mix(.42, 1., vg)*(1.-uP*.7);
        col += (hash(uv*uR+fract(uTime))-.5)*.05;
        gl_FragColor = vec4(col, 1.);
      }`;
    const sh = (t, src) => { const o = g.createShader(t); g.shaderSource(o, src); g.compileShader(o); return g.getShaderParameter(o, g.COMPILE_STATUS) ? o : null; };
    const a = sh(g.VERTEX_SHADER, vs), b = sh(g.FRAGMENT_SHADER, fs); if (!a || !b) return null;
    const pr = g.createProgram(); g.attachShader(pr, a); g.attachShader(pr, b); g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
    g.useProgram(pr);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = {}; ["uT", "uR", "uI", "uM", "uTime", "uP", "uF"].forEach((n) => (U[n] = g.getUniformLocation(pr, n)));
    const st = { prog: 0, mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, on: false, vis: true, ready: null };
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 1.6); c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr); g.viewport(0, 0, c.width, c.height); g.uniform2f(U.uR, c.width, c.height); };
    st.ready = new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        try {
          const tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex);
          g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
          g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, img);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
          g.uniform2f(U.uI, img.naturalWidth, img.naturalHeight); g.uniform1f(U.uF, S.heroFocus ?? 0.74);
          size(); addEventListener("resize", size);
          st.on = true; c.classList.add("on"); requestAnimationFrame(draw);
        } catch (e) { /* CSS photo stays */ }
        res();
      };
      img.onerror = res; img.src = S.hero;
    });
    new IntersectionObserver(([e]) => { st.vis = e.isIntersecting; if (st.vis && st.on) requestAnimationFrame(draw); }).observe(c);
    addEventListener("pointermove", (e) => { st.tx = e.clientX / innerWidth; st.ty = 1 - e.clientY / innerHeight; }, { passive: true });
    function draw(t) {
      if (!st.on || !st.vis || document.hidden) return;
      st.mx += (st.tx - st.mx) * 0.05; st.my += (st.ty - st.my) * 0.05;
      g.uniform1f(U.uTime, t / 1000); g.uniform1f(U.uP, st.prog); g.uniform2f(U.uM, st.mx, st.my);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(draw);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden && st.on) requestAnimationFrame(draw); });
    return st;
  })();

  /* =============================== reveals =============================== */
  function reveal(scope) {
    if (!motion) return;
    $$(".h-sec", scope).forEach((h) => {
      const chars = $$(".sc", h).length ? $$(".sc", h) : split(h, h.textContent.trim());
      G.from(chars, { yPercent: 115, duration: 1.3, stagger: 0.035, scrollTrigger: { trigger: h, start: "top 88%" } });
    });
    $$(".mask", scope).forEach((m) => {
      if (m.closest(".jr-stage")) return;
      const horiz = !!m.closest(".frame");
      const tg = { trigger: m.closest(".frame, .lead, .step, .reel") || m, start: "top 82%" };
      if (horiz && hTween) Object.assign(tg, { containerAnimation: hTween, start: "left 92%", trigger: m.closest(".frame") });
      G.fromTo(m, { clipPath: horiz ? "inset(0% 100% 0% 0%)" : "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: tg });
      const im = $("img", m); if (im) G.from(im, { scale: 1.35, duration: 2, scrollTrigger: tg });
    });
    $$(".par", scope).forEach((p) => G.fromTo(p, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: p.parentNode, start: "top bottom", end: "bottom top", scrub: true } }));
    const rv = $$("[data-rv]", scope);
    if (rv.length) { G.set(rv, { y: 44, opacity: 0 }); ST.batch(rv, { start: "top 90%", once: true, onEnter: (els) => G.to(els, { y: 0, opacity: 1, duration: 1.2, stagger: 0.09, overwrite: true }) }); }
  }

  /* =============================== the stills reel =============================== */
  let hTween = null;
  function initReel() {
    if (!motion || !stills.length) return;
    const mm = G.matchMedia();
    mm.add("(min-width: 901px) and (hover: hover) and (pointer: fine)", () => {
      const sec = $("#stills"), pin = $("#stPin"), track = $("#strip");
      sec.classList.add("hscroll");
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const skew = G.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
      hTween = G.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top top", end: () => "+=" + dist(), pin: pin, scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate(self) { skew(G.utils.clamp(-7, 7, self.getVelocity() / -260)); pin.style.setProperty("--rail", (-self.progress * dist() * 1.15).toFixed(1) + "px"); }
        }
      });
      return () => { sec.classList.remove("hscroll"); hTween = null; G.set(track, { clearProps: "all" }); };
    });
  }

  /* =============================== page choreography =============================== */
  function initPage() {
    if (!motion) return;
    // hero: names part, the date arrives
    const tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".hero", start: "top top", end: "+=115%", pin: true, scrub: 0.7, onUpdate: (s) => { if (gl) gl.prog = s.progress; } } });
    tl.fromTo(".w-a", { xPercent: 0, opacity: 1 }, { xPercent: -70, opacity: 0, ease: "power2.in", duration: 0.45 }, 0)
      .fromTo(".w-b", { xPercent: 0, opacity: 1 }, { xPercent: 70, opacity: 0, ease: "power2.in", duration: 0.45 }, 0)
      .fromTo(".title .amp", { scale: 1, opacity: 1 }, { scale: 0.3, opacity: 0, duration: 0.3 }, 0)
      .fromTo(".hero-pre, .rule, .tagline, .timecode, .scroll-cue", { opacity: 1, y: 0 }, { opacity: 0, y: -40, stagger: 0.02, duration: 0.3 }, 0)
      .fromTo("#since", { opacity: 0, scale: 0.86, y: 50 }, { opacity: 1, scale: 1, y: 0, ease: "power2.out", duration: 0.32 }, 0.36)
      .to("#since", { opacity: 0, y: -50, duration: 0.14 }, 0.86);

    // marquee driven by scroll speed
    const mq = $(".mq-track");
    if (mq) {
      let x = 0, dir = -1;
      const half = () => mq.scrollWidth / 2;
      G.ticker.add(() => {
        const vel = lenis ? lenis.velocity : 0;
        if (vel) dir = vel > 0 ? -1 : 1;
        x += dir * (0.7 + Math.min(Math.abs(vel) * 0.5, 22));
        const h = half(); if (x <= -h) x += h; if (x > 0) x -= h;
        mq.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      });
    }

    initReel();
    reveal(document);

    // closing title
    if (finChars.length) G.from(finChars, { yPercent: 120, stagger: 0.04, duration: 1.4, scrollTrigger: { trigger: "#fin", start: "top 85%" } });

    // progress, nav, chapters
    G.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    const nav = $("#nav");
    ST.create({ start: 0, end: "max", onUpdate: (s) => { nav.classList.toggle("away", s.direction === 1 && s.scroll() > innerHeight * 0.5); nav.classList.toggle("solid", s.scroll() > innerHeight * 0.5); } });
    chapEls.forEach((el, k) => ST.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && chapLinks.forEach((a, j) => a.classList.toggle("on", j === k)) }));
    chapLinks[0]?.classList.add("on");
  }

  /* =============================== pointer: cursor, tilt, magnets =============================== */
  if (motion && fine) {
    root.classList.add("has-cursor");
    const cur = $("#cursor"), lab = $("#cursorLabel");
    const cx = G.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), cy = G.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); cur.classList.remove("gone"); }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.add("gone"));
    document.addEventListener("pointerover", (e) => {
      const l = e.target.closest("[data-cur]"), a = e.target.closest("a, button, input");
      cur.classList.toggle("label", !!l); cur.classList.toggle("link", !l && !!a && a.tagName !== "INPUT");
      cur.classList.toggle("gone", !!a && a.tagName === "INPUT");
      if (l) lab.textContent = l.dataset.cur;
    });
    // magnetic buttons
    document.addEventListener("pointermove", (e) => {
      $$("[data-mag]").forEach((m) => {
        const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const near = Math.abs(dx) < r.width * 0.8 && Math.abs(dy) < r.height * 1.4;
        G.to(m, { x: near ? dx * 0.3 : 0, y: near ? dy * 0.4 : 0, duration: near ? 0.5 : 1, ease: near ? "power3" : "elastic.out(1,0.4)", overwrite: "auto" });
      });
    }, { passive: true });
    // portrait tilt
    $$("[data-tilt]").forEach((el) => {
      const inner = $(".par", el) || el;
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; G.to(inner, { rotateY: px * 7, rotateX: -py * 7, scale: 1.04, transformPerspective: 900, duration: 0.9, overwrite: "auto" }); });
      el.addEventListener("pointerleave", () => G.to(inner, { rotateY: 0, rotateX: 0, scale: 1, duration: 1.4, overwrite: "auto" }));
    });
    // ticket tilt + sheen
    const scene = $(".ticket-scene"), tk = $("#gate");
    scene.addEventListener("pointermove", (e) => { const r = scene.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; G.to(tk, { rotateY: (px - 0.5) * 10, rotateX: -(py - 0.5) * 8, duration: 0.8, overwrite: "auto" }); tk.style.setProperty("--gx", (px * 100).toFixed(1) + "%"); tk.style.setProperty("--gy", (py * 100).toFixed(1) + "%"); });
    scene.addEventListener("pointerleave", () => G.to(tk, { rotateY: 0, rotateX: 0, duration: 1.4, ease: "elastic.out(1,0.5)", overwrite: "auto" }));
  }

  /* =============================== opening sequence =============================== */
  (async () => {
    const loader = $("#loader");
    const heroReady = S.hero ? new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = S.hero; }) : 0;
    if (!motion) { loader.remove(); return; }
    const chars = $$(".title .ch");
    const num = $("#ldNum");
    const count = (async () => { for (const n of [3, 2, 1]) { num.textContent = n; G.fromTo(num, { scale: 1.25, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }); await wait(700); } })();
    await Promise.race([Promise.all([count, heroReady, document.fonts ? document.fonts.ready : 0, gl ? gl.ready : 0]), wait(6000)]);
    initPage();
    G.set(chars, { yPercent: 118 });
    G.set(".title .amp", { opacity: 0, scale: 0.5 });
    G.set(".hero-pre, .tagline, .timecode, .scroll-cue, #nav, #chapters", { opacity: 0 });
    G.set(".rule", { scaleX: 0 });
    const intro = G.timeline({ onComplete: () => { loader.remove(); if (lenis) lenis.start(); ST.refresh(); } });
    intro.to("#ldCore", { scale: 0.7, opacity: 0, duration: 0.5, ease: "power3.in" })
      .to(".ld-top", { yPercent: -101, duration: 1.5, ease: "expo.inOut" }, "-=0.05")
      .to(".ld-bot", { yPercent: 101, duration: 1.5, ease: "expo.inOut" }, "<")
      .to(chars, { yPercent: 0, duration: 1.5, stagger: 0.055 }, "-=0.95")
      .to(".title .amp", { opacity: 1, scale: 1, duration: 1.2 }, "-=1.2")
      .fromTo(chars, { backgroundPosition: "100% 0" }, { backgroundPosition: "45% 0", duration: 2.4, ease: "power2.out", stagger: 0.03 }, "-=1.4")
      .to(".rule", { scaleX: 1, duration: 1.6 }, "-=2.2")
      .to(".hero-pre, .tagline, .timecode, .scroll-cue, #nav, #chapters", { opacity: 1, duration: 1.4, stagger: 0.08, ease: "power2.out" }, "-=2");
  })();

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
  const urls = new Map();
  const picUrl = (pic) => { if (!urls.has(pic.f)) urls.set(pic.f, open(key, pic.f).then((b) => URL.createObjectURL(new Blob([b], { type: pic.t })))); return urls.get(pic.f); };
  const lazy = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { lazy.unobserve(e.target); fill(e.target); } }), { rootMargin: "700px 0px" }) : null;
  function fill(img) { picUrl(JSON.parse(img.dataset.enc)).then((u) => { img.onload = () => img.classList.add("ready"); img.src = u; }).catch(() => {}); }
  const encImg = (pic, alt, ratio) => pic ? `<img data-enc='${esc(JSON.stringify({ f: pic.f, t: pic.t }))}' alt="${esc(alt || "")}"${ratio && pic.w && pic.h ? ` style="aspect-ratio:${+pic.w}/${+pic.h}"` : ""}>` : "";
  const ytId = (u) => { const m = /(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/.exec(u || ""); return m ? m[1] : null; };

  let wallCols = 0;
  function layoutWall() {
    const wall = $("#wall"); if (!wall) return;
    const n = innerWidth > 1000 ? 3 : 2; if (n === wallCols) return; wallCols = n;
    const btns = $$(".shot", wall).sort((a, b) => a.dataset.k - b.dataset.k);
    wall.innerHTML = Array.from({ length: n }, () => '<div class="wall-col"></div>').join("");
    const cols = $$(".wall-col", wall), h = cols.map(() => 0);
    btns.forEach((b) => { const p = shots[+b.dataset.k].photo || {}; const i = h.indexOf(Math.min(...h)); cols[i].appendChild(b); h[i] += p.w && p.h ? p.h / p.w : 1; });
    if (motion) { ST.getAll().filter((t) => t.vars.id === "wall").forEach((t) => t.kill()); cols.forEach((c, i) => G.fromTo(c, { y: i % 2 ? 90 : 0 }, { y: i % 2 ? -90 : 0, ease: "none", scrollTrigger: { id: "wall", trigger: wall, start: "top bottom", end: "bottom top", scrub: 0.6 } })); }
  }

  function renderVault(c) {
    const j = c.journey || [], w = c.wedding || {}, hl = c.highlights || [];
    shots = w.photos || [];
    vault.innerHTML = `
      ${j.length ? `<section class="wrap" id="journey"><h2 class="h-sec">Our journey</h2>
        <div class="jr">
          <div class="jr-stage"><div class="jr-frame">${j.map((s) => `<div class="jr-pic">${encImg(s.photo, s.title)}</div>`).join("")}</div><span class="jr-count" id="jrCount">01 / ${pad(j.length)}</span></div>
          <div class="jr-steps">${j.map((s, k) => `
            <article class="step${k ? "" : " on"}">
              <div class="step-pic mask">${encImg(s.photo, s.title)}</div>
              <span class="step-no" aria-hidden="true">${pad(k + 1)}</span>
              <span class="step-date">${esc(s.date)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
            </article>`).join("")}</div>
        </div></section>` : ""}
      ${shots.length ? `<section class="wrap" id="wedding"><h2 class="h-sec">${esc(w.title || "The wedding")}</h2>
        ${w.intro ? `<p class="lede" data-rv>${esc(w.intro)}</p>` : ""}
        ${w.date || w.place ? `<p class="wed-meta" data-rv>${esc([w.date, w.place].filter(Boolean).join("  /  "))}</p>` : ""}
        <div class="wall" id="wall">${shots.map((p, k) => `<button class="shot" type="button" data-k="${k}" data-cur="View" aria-label="Open photo ${k + 1}">${encImg(p.photo, p.caption, true)}</button>`).join("")}</div></section>` : ""}
      ${hl.length ? `<section class="wrap" id="highlights"><h2 class="h-sec">Highlights</h2>
        <div class="reels">${hl.map((r, k) => { const yt = ytId(r.url); const inner = `<div class="reel-pic mask">${encImg(r.thumb, "")}<span class="reel-play"></span><div class="reel-meta"><h3>${esc(r.title)}</h3><span>${esc(r.note)}</span></div></div>`;
          return yt ? `<button class="reel" type="button" data-v="${k}" data-cur="Play">${inner}</button>` : `<a class="reel" href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener" data-cur="Open">${inner}</a>`; }).join("")}</div></section>` : ""}
      <div class="wrap"><button class="relock" type="button" id="relock">Lock the film again</button></div>`;
    vault._hl = hl;
    wallCols = 0; layoutWall();
    $$("img[data-enc]", vault).forEach((im) => (lazy ? lazy.observe(im) : fill(im)));
    $("#relock").onclick = () => { try { sessionStorage.removeItem(KEY); } catch (e) {} location.reload(); };
  }

  function initVault() {
    if (!motion) return;
    reveal(vault);
    // journey: fixed projector frame, scenes change as the text scrolls by
    const pics = $$(".jr-pic", vault), steps = $$(".step", vault), count = $("#jrCount");
    let cur = 0, z = 1;
    const show = (i) => {
      if (i === cur || !pics[i]) return; const up = i < cur; cur = i;
      steps.forEach((s, k) => s.classList.toggle("on", k === i));
      if (count) count.textContent = `${pad(i + 1)} / ${pad(pics.length)}`;
      G.set(pics[i], { zIndex: ++z });
      G.fromTo(pics[i], { clipPath: up ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", overwrite: true });
      const im = $("img", pics[i]); if (im) G.fromTo(im, { scale: 1.3 }, { scale: 1, duration: 1.9, overwrite: true });
    };
    steps.forEach((s, i) => ST.create({ trigger: s, start: "top 52%", end: "bottom 52%", onToggle: (t) => t.isActive && innerWidth > 900 && show(i) }));
    $$(".shot", vault).forEach((b) => G.from(b, { opacity: 0, y: 70, duration: 1.3, scrollTrigger: { trigger: b, start: "top 96%" } }));
    ST.refresh();
  }
  addEventListener("resize", () => { const before = wallCols; layoutWall(); if (before !== wallCols && motion) ST.refresh(); });

  async function unlock(pw, quiet) {
    btn.disabled = true; msg.textContent = "";
    try {
      const k = await derive(pw);
      const content = JSON.parse(new TextDecoder().decode(await open(k, meta.content)));
      key = k;
      try { sessionStorage.setItem(KEY, pw); } catch (e) {}
      renderVault(content);
      const show = () => { gateWrap.hidden = true; vault.hidden = false; initVault(); };
      if (quiet || !motion) { show(); if (!quiet) vault.scrollIntoView(); }
      else {
        gate.classList.add("torn");
        G.timeline()
          .set("#wipe", { transformOrigin: "50% 100%" }, 0.45)
          .to("#wipe", { scaleY: 1, duration: 0.75, ease: "expo.inOut" }, 0.45)
          .add(() => { show(); if (lenis) lenis.scrollTo(vault, { immediate: true, offset: -40, force: true }); else vault.scrollIntoView(); })
          .set("#wipe", { transformOrigin: "50% 0%" })
          .to("#wipe", { scaleY: 0, duration: 0.9, ease: "expo.inOut" }, "+=0.1");
      }
    } catch (err) {
      if (quiet) { try { sessionStorage.removeItem(KEY); } catch (e) {} }
      else if (err && err.message === "missing") msg.textContent = "The film isn't loaded on this site yet. Run tools/lock.mjs and push again.";
      else if (!(window.crypto && crypto.subtle)) msg.textContent = "This page must be opened over https (or localhost) to unlock.";
      else { msg.textContent = `That password didn't work. Check with ${names[0]} or ${names[1]}.`; gate.classList.remove("shake"); void gate.offsetWidth; gate.classList.add("shake"); $("#pw").select(); }
    } finally { btn.disabled = false; }
  }
  gate.addEventListener("submit", (e) => { e.preventDefault(); const pw = $("#pw").value; if (pw) unlock(pw, false); });
  try { const saved = sessionStorage.getItem(KEY); if (saved) unlock(saved, true); } catch (e) {}

  /* =============================== lightbox =============================== */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount");
  let cur = 0, lastFocus = null;
  async function showShot(k, from) {
    const dir = Math.sign(k - cur) || 1;
    cur = (k + shots.length) % shots.length;
    const p = shots[cur];
    lbCap.textContent = p.caption || ""; lbCount.textContent = `${pad(cur + 1)} / ${pad(shots.length)}`;
    lbImg.alt = p.caption || `Photo ${cur + 1}`;
    const u = await picUrl(p.photo);
    await new Promise((r) => { lbImg.onload = r; lbImg.onerror = r; lbImg.src = u; if (lbImg.complete) r(); });
    if (!motion) return;
    if (from) { // grow from the thumbnail
      const a = from.getBoundingClientRect(), b = lbImg.getBoundingClientRect();
      G.fromTo(lbImg, { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.width / b.width, opacity: 0.6 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.9, ease: "expo.out", overwrite: true });
    } else G.fromTo(lbImg, { x: dir * 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, overwrite: true });
  }
  const closeLb = () => { lb.hidden = true; lockScroll(false); if (lastFocus) lastFocus.focus({ preventScroll: true }); };
  vault.addEventListener("click", (e) => {
    const s = e.target.closest(".shot");
    if (s) { lastFocus = s; lb.hidden = false; lockScroll(true); cur = +s.dataset.k; showShot(cur, s); $("#lbClose").focus(); return; }
    const v = e.target.closest(".reel[data-v]"); if (v) openVideo(vault._hl[+v.dataset.v], v);
  });
  $("#lbClose").onclick = closeLb;
  $("#lbPrev").onclick = () => showShot(cur - 1);
  $("#lbNext").onclick = () => showShot(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  let sx = null;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) showShot(cur + (dx < 0 ? 1 : -1)); });

  /* =============================== video player =============================== */
  const vm = $("#vmodal"), vmFrame = $("#vmFrame");
  function openVideo(item, from) {
    const id = ytId(item.url); if (!id) return;
    const t = /[?&]t=(\d+)/.exec(item.url);
    lastFocus = from; vm.hidden = false; lockScroll(true);
    $("#vmTitle").textContent = item.title || ""; $("#vmLink").href = safeUrl(item.url);
    vmFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1${t ? "&start=" + t[1] : ""}" title="${esc(item.title || "Video")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    if (motion) G.fromTo(".vm-box", { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.9 });
    $("#vmClose").focus();
  }
  const closeVm = () => { vm.hidden = true; vmFrame.innerHTML = ""; lockScroll(false); if (lastFocus) lastFocus.focus({ preventScroll: true }); };
  $("#vmClose").onclick = closeVm;
  vm.addEventListener("click", (e) => { if (e.target === vm) closeVm(); });
  addEventListener("keydown", (e) => {
    if (!vm.hidden && e.key === "Escape") return closeVm();
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") showShot(cur - 1); else if (e.key === "ArrowRight") showShot(cur + 1);
  });
})();
