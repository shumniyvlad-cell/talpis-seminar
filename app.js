(() => {
  const shot = location.search.includes('shot'); if (shot) document.documentElement.dataset.shot = '1';
  const only = new URLSearchParams(location.search).get('only');
  if (only) { const keep = only.split(','); document.querySelectorAll('body > section, body > footer').forEach(s => { if (!keep.includes(s.id || s.tagName.toLowerCase())) s.style.display = 'none'; }); }
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || shot;

  /* интро-занавес и прогресс-точка */
  const intro = $('[data-intro]');
  if (intro) { if (reduce) intro.remove(); else { document.documentElement.style.overflow = 'hidden'; setTimeout(() => { intro.classList.add('is-off'); document.documentElement.style.overflow = ''; setTimeout(() => intro.remove(), 1100); }, 1250); } }
  const prog = $('[data-prog]');
  if (prog) { const upd = () => { const max = document.documentElement.scrollHeight - innerHeight; prog.style.top = (100 * Math.min(1, Math.max(0, scrollY / max))) + '%'; }; addEventListener('scroll', upd, { passive: true }); upd(); }

  /* видео hero: горизонтальное или вертикальное по ширине экрана */
  const hv = $('[data-hero-video]');
  if (hv) { const mob = matchMedia('(max-width: 900px)').matches; if (mob && !hv.dataset.mobile) hv.remove(); else { hv.poster = mob ? hv.dataset.posterM : hv.dataset.posterD; hv.src = mob ? hv.dataset.mobile : hv.dataset.desktop; hv.load(); const tryPlay = () => hv.play().catch(() => {}); tryPlay(); addEventListener('touchstart', tryPlay, { once: true, passive: true }); } }

  /* планка */
  const bar = $('[data-bar]');
  const onBar = () => bar.classList.toggle('is-on', scrollY > innerHeight * .85);
  addEventListener('scroll', onBar, { passive: true }); onBar();

  /* строки заголовков */
  const splitLines = el => {
    const tokens = [];
    [...el.childNodes].forEach(n => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (t.trim()) { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; tokens.push(s); } }); else if (n.nodeType === 1) tokens.push(n); });
    el.textContent = ''; tokens.forEach((t, i) => { el.appendChild(t); const nx = tokens[i + 1]; if (nx && !/^[,.;:!?»)]/.test(nx.textContent)) el.appendChild(document.createTextNode(' ')); });
    const lines = []; let top = null;
    tokens.forEach(t => { const y = t.offsetTop; if (top === null || Math.abs(y - top) > 4) { lines.push([]); top = y; } lines[lines.length - 1].push(t); });
    el.textContent = '';
    lines.forEach((ws, li) => { const ln = document.createElement('span'); ln.className = 'ln'; const inner = document.createElement('span'); inner.style.transitionDelay = (li * 90) + 'ms'; ws.forEach((t, i) => { inner.appendChild(t); const nx = ws[i + 1]; if (nx && !/^[,.;:!?»)]/.test(nx.textContent)) inner.appendChild(document.createTextNode(' ')); }); ln.appendChild(inner); el.appendChild(ln); });
  };
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    $$('[data-lines]').forEach(splitLines);
    const els = $$('[data-lines], [data-wipe], [data-stagger]');
    if (reduce) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const el = e.target; io.unobserve(el); if (el.hasAttribute('data-stagger')) [...el.children].forEach((c, i) => c.style.transitionDelay = (i * 70) + 'ms'); el.classList.add('is-in'); }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  });

  /* счётчики */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = b => { const to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), d = 1400; const fmt = n => n.toLocaleString('ru-RU').replace(/,/g, ' ');
      const step = now => { const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); b.textContent = fmt(Math.round(to * e)) + (k >= 1 ? suf : ''); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    if (reduce) counters.forEach(b => b.textContent = (+b.dataset.count).toLocaleString('ru-RU').replace(/,/g, ' ') + (b.dataset.suffix || ''));
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } }), { threshold: .5 }); counters.forEach(b => io.observe(b)); }
  }

  /* параллакс */
  const par = $$('[data-parallax]');
  if (par.length && !reduce) { const tick = () => par.forEach(img => { const r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; img.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * +img.dataset.parallax}px)`; }); addEventListener('scroll', tick, { passive: true }); tick(); }

  /* сторителлинг тем: активная тема → её фото */
  const story = $('[data-story]');
  if (story) {
    const imgs = $$('[data-story-img]', story), items = $$('[data-story-item]', story);
    const set = i => { imgs.forEach(im => im.classList.toggle('is-on', +im.dataset.storyImg === i)); items.forEach(li => li.classList.toggle('is-on', +li.dataset.storyItem === i)); };
    if (reduce) { set(0); items.forEach(li => li.classList.add('is-on')); }
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.storyItem); }), { rootMargin: '-45% 0px -45% 0px', threshold: 0 }); items.forEach(li => io.observe(li)); set(0); }
  }

  /* силуэты */
  const ATLAS = [1, 2, 3, 4, 5, 6].map(i => { const im = new Image(); im.src = `assets/walkers/atlas/w0${i}.png`; return im; });
  const FW = 300, FH = 560; const tintCache = new Map();
  const tinted = (img, color) => { const k = img.src + color; if (tintCache.has(k)) return tintCache.get(k); const c = document.createElement('canvas'); c.width = 2400; c.height = 560; const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, 2400, 560); tintCache.set(k, c); return c; };
  const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const startLoop = fn => { if (shot) { fn(performance.now()); ATLAS.forEach(i => { const re = () => fn(performance.now()); if (i.complete) re(); else i.addEventListener('load', re, { once: true }); }); } else requestAnimationFrame(fn); };
  const next = fn => { if (!shot) requestAnimationFrame(fn); };


  const sc = $('[data-scheme]');
  if (sc) {
    const ctx = sc.getContext('2d'); let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = sc.clientWidth; H = sc.clientHeight; sc.width = W * dpr; sc.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const N = 8, pts = [];
    for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / N + (Math.random() - .5) * .5; pts.push({ a, r: .28 + Math.random() * .14, ph: Math.random() * 6, atlas: i % 6, alive: 1, gone: false }); }
    const t0 = performance.now();
    const draw = now => {
      if (!shot && (!onScreen(sc) || reduce)) { requestAnimationFrame(draw); return; }
      const t = (now - t0) / 1000; ctx.clearRect(0, 0, W, H); const cx = W * .5, cy = H * .56, R = Math.min(W, H);
      const cyc = t % 9, victim = Math.floor(t / 9) % N;
      pts.forEach((p, i) => { p.gone = i === victim && cyc > 5 && cyc < 8.6; p.alive += ((p.gone ? 0 : 1) - p.alive) * .05; });
      const spread = pts.some(q => q.gone) ? 1.08 : 1;
      const pos = pts.map(p => { const wob = Math.sin(t * .6 + p.ph) * .012; return { x: cx + Math.cos(p.a) * (p.r + wob) * R * 1.6 * spread, y: cy + Math.sin(p.a) * (p.r + wob) * R * .9 * spread, p }; });
      pos.forEach(({ x, y, p }) => { ctx.strokeStyle = `rgba(244,239,230,${.22 * p.alive})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); });
      const pulse = (Math.sin(now / 700) + 1) / 2; ctx.fillStyle = `rgba(217,110,43,${.14 + pulse * .1})`; ctx.beginPath(); ctx.arc(cx, cy, 18 + pulse * 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#D96E2B'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      pos.forEach(({ x, y, p }) => { const a = Math.max(0, p.alive); ctx.fillStyle = `rgba(244,239,230,${.16 * a})`; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(244,239,230,${.95 * a})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); });
      next(draw);
    };
    startLoop(draw);
  }
})();
