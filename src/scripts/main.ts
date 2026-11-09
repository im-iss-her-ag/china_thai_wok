import { berlinNow, openStatus, statusText } from '../lib/hours';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const body = document.body;

/* Stabile Viewporthöhe für Scroll-Rechnungen: innerHeight springt am Handy, sobald die Browserleiste
   ein-/ausblendet → Animationen & Header würden ruckeln. Wir messen 100lvh (wie die CSS-Pins) und
   aktualisieren nur, wenn sich die Breite ändert (Drehen, Fenstergröße) – nicht bei der Leiste. */
const vhProbe = document.createElement('div');
vhProbe.style.cssText = 'position:absolute;top:0;left:0;width:0;height:calc(100 * var(--lv));visibility:hidden;pointer-events:none';
body.appendChild(vhProbe);
let VH = vhProbe.offsetHeight || innerHeight;
let lastW = innerWidth;
addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; VH = vhProbe.offsetHeight || innerHeight; } });

/* ---------- Intro curtain (1× pro Sitzung) ---------- */
const curtain = $('#curtain');
let seen = false;
try { seen = sessionStorage.getItem('ctw-intro') === '1'; sessionStorage.setItem('ctw-intro', '1'); } catch {}
if (curtain && !seen && !reduce) {
  curtain.hidden = false;
  body.classList.add('lock', 'intro');
  // 1) Logo-Phase (CSS, ~0,9 s)  2) Türen öffnen (1,1 s)  3) aufräumen
  requestAnimationFrame(() => curtain.classList.add('play'));
  setTimeout(() => curtain.classList.add('open'), 950);
  setTimeout(() => { body.classList.remove('lock'); body.classList.add('ready'); }, 1500);
  setTimeout(() => curtain.remove(), 2300);
} else {
  curtain?.remove();
  requestAnimationFrame(() => body.classList.add('ready'));
}

/* ---------- Header ---------- */
const hdr = $('#hdr')!;
let lastY = scrollY;
let hidden = false;
const onHeader = () => {
  const y = Math.min(Math.max(scrollY, 0), Math.max(0, document.documentElement.scrollHeight - innerHeight));
  hdr.classList.toggle('solid', y > 40);
  const d = y - lastY;
  if (Math.abs(d) < 12) return; // kleine Zuckungen (Leiste, Gummiband) ignorieren
  hidden = y > 400 && d > 0;
  hdr.classList.toggle('hide', hidden);
  body.classList.toggle('hdr-on', !hidden);
  lastY = y;
};
addEventListener('scroll', onHeader, { passive: true });
onHeader();

/* ---------- Cursor & magnetic ---------- */
if (fine && !reduce) {
  body.classList.add('has-cursor');
  const cur = $('.cur')!, dot = $('.cur-dot')!, label = $('span', cur)!;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx - 3}px,${my - 3}px)`; });
  const loop = () => { cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16; cur.style.transform = `translate(${cx - cur.offsetWidth / 2}px,${cy - cur.offsetHeight / 2}px)`; requestAnimationFrame(loop); };
  loop();
  $$('[data-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => { cur.classList.add('big'); label.textContent = el.dataset.hover || ''; });
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
  $$('[data-mag]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => (el.style.transform = ''));
  });
  const gate = $('#gate .ph');
  if (gate) $('.hero')!.addEventListener('mousemove', (e) => {
    const x = (e.clientX / innerWidth - 0.5) * 26, y = (e.clientY / innerHeight - 0.5) * 26;
    gate.style.transform = `translate(${x}px,${y}px) scale(1.06)`;
  });
}

/* ---------- Reveal ---------- */
// [data-clip] ist per clip-path komplett verborgen → IO würde nie auslösen; daher den Eltern-Container beobachten.
const targets = new Map<Element, Element>();
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  targets.get(e.target)!.classList.add('in');
  io.unobserve(e.target);
}), { threshold: 0.15 });
$$('[data-rv]').forEach((el) => { targets.set(el, el); io.observe(el); });
$$('[data-clip]').forEach((el) => { const p = el.parentElement ?? el; targets.set(p, el); io.observe(p); });

/* ---------- Scroll-driven sections ---------- */
const scrollers: (() => void)[] = [];

/* Wolken zeichnen sich, sobald sie sichtbar werden */
if (!reduce) $$('svg.cloud').forEach((c) => { c.classList.add('draw'); targets.set(c, c); io.observe(c); });

/* Wörter leuchten nacheinander auf ([data-words]) */
$$('[data-words]').forEach((stmt) => {
  const walk = (n: Node) => {
    [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent!.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.append(t);
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); }
        });
        c.replaceWith(frag);
      } else if (c instanceof HTMLElement && !c.classList.contains('inl')) walk(c);
    });
  };
  walk(stmt);
  // Bewusst scroll-gekoppelt (Design-Entscheidung): Wörter leuchten im Takt der Scrollbar auf.
  const words = $$('.w', stmt);
  scrollers.push(() => {
    const r = stmt.getBoundingClientRect();
    const p = clamp((VH * 0.85 - r.top) / (r.height + VH * 0.3));
    words.forEach((w, i) => w.classList.toggle('on', i / words.length < p));
  });
});

/* #2 Burst-Galerie: --t 0 (Stapel) → 1 (aufgefächert), folgt der Scrollbar in beide Richtungen */
const burst = $('#burst'), bpin = $('#burstPin');
if (burst && bpin) scrollers.push(() => {
  const r = burst.getBoundingClientRect();
  // startet schon, wenn die Sektion von unten ins Bild kommt (nicht erst beim Pinnen)
  // Start beim Hereinkommen, voll aufgefächert kurz nach dem Pinnen (≈ 0,3 Viewport), danach kurz halten
  const t = reduce ? 1 : clamp((VH * 0.9 - r.top) / (VH * 1.2));
  const e = 1 - Math.pow(1 - t, 3);
  bpin.style.setProperty('--t', e.toFixed(4));
});

const zs = $('#zoom'), zp = $('#zpin');
if (zs && zp) scrollers.push(() => {
  const r = zs.getBoundingClientRect(), t = clamp(-r.top / (r.height - VH));
  zp.style.setProperty('--r', 14 + t * t * 80 + '%');
  zp.style.setProperty('--s', String(1.3 - t * 0.3));
  zp.style.setProperty('--po', String(clamp(1 - t * 3)));
  zp.style.setProperty('--o', String(clamp((t - 0.55) * 3)));
});

const hs = $('#signature'), track = $('#track'), prog = $('#prog');
const hcards = $$('.hcard', hs ?? document), hsNo = $('#hsNo');
const isMob = () => innerWidth <= 860;
/* Mobil: „Drehteller“ läuft von selbst (kein Scroll-Pinning) – jede Sekunde nächstes Gericht, Wischen möglich */
const placeCards = (f: number) => {
  hcards.forEach((c, i) => {
    const d = i - f, a = Math.min(Math.abs(d), 1.5);
    c.style.transform = `translate3d(calc(-50% + ${(d * 64).toFixed(2)}vw),${(a * a * 18).toFixed(1)}px,0) rotate(${(d * 12).toFixed(2)}deg) scale(${(1 - Math.min(a, 1) * 0.3).toFixed(3)})`;
    c.style.opacity = String(clamp(1 - (a - 0.6) * 1.1));
    c.style.zIndex = String(10 - Math.round(a * 4));
    c.style.setProperty('--tv', clamp(1 - a * 2.4).toFixed(3));
    c.style.setProperty('--spin', (d * -110).toFixed(1) + 'deg');
  });
};
if (hs && prog && hcards.length && !reduce) {
  const n = hcards.length;
  let cur = 0, f = 0, from = 0, t0 = 0, anim = 0, timer = 0, visible = false, paused = 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 4);
  const show = () => { if (hsNo) hsNo.textContent = String(cur + 1).padStart(2, '0'); prog.style.width = ((cur + 1) / n) * 100 + '%'; };
  const go = (to: number) => {
    if (!isMob()) return;
    // weich umlaufen: vom letzten zum ersten über die Gegenrichtung ohne Sprung
    cur = (to + n) % n; from = f; t0 = performance.now(); cancelAnimationFrame(anim);
    const target = cur;
    const step = (now: number) => {
      const k = clamp((now - t0) / 550);
      f = from + (target - from) * ease(k); placeCards(f);
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step); show();
  };
  const loop = () => { clearTimeout(timer); timer = window.setTimeout(() => { if (visible && isMob() && performance.now() > paused) go(cur + 1); loop(); }, 1000); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 }).observe(hs);
  let sx = 0, sy = 0;
  hs.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  hs.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { paused = performance.now() + 6000; go(cur + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
  if (isMob()) { placeCards(0); show(); }
  addEventListener('resize', () => { if (isMob()) placeCards(f); else hcards.forEach((c) => c.removeAttribute('style')); });
  loop();
}
if (hs && track && prog) scrollers.push(() => {
  if (isMob()) return;
  const r = hs.getBoundingClientRect(), max = track.scrollWidth - innerWidth;
  const t = clamp(-r.top / (r.height - VH));
  track.style.transform = `translateX(${-t * max}px)`;
  prog.style.width = t * 100 + '%';
});

// Parallax: erst alle Positionen lesen, dann schreiben (kein Layout-Thrashing). Rechnung wie bisher.
const pars = $$('[data-par]');
if (pars.length && !reduce) scrollers.push(() => {
  const ys = pars.map((el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2 - VH / 2; });
  pars.forEach((el, i) => { el.style.transform = `translate3d(0,${(ys[i] * +el.dataset.par!).toFixed(1)}px,0)`; });
});

if (scrollers.length) {
  let ticking = false;
  const run = () => { scrollers.forEach((f) => f()); ticking = false; };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener('resize', run);
  run();
}

/* ---------- #1 Raum-Slider: Wisch-Übergang (Wipe), Ziehen/Wischen, Auto-Weiter ---------- */
const slider = $('#slider'), track2 = $('#track2'), edge = $('#edge'), cnum = $('#cnum');
if (slider && track2 && edge) {
  const slides = $$('.slide', track2), dots = $$('.dots button', slider);
  const n = slides.length, DUR = 5500, ANIM = 1150;
  let i = 0, timer = 0, visible = false, busy = false;
  let dragging = false, startX = 0, dx = 0, moved = false, tgt = -1, dir = 1;
  slider.style.setProperty('--dur', DUR + 'ms');
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // p: 0 → 1  Fortschritt des Wischens von Folie i zu Folie k in Richtung d (1 = nach links wischen)
  const paint = (k: number, d: number, p: number) => {
    slides.forEach((s, m) => {
      s.classList.toggle('is-cur', m === i);
      s.classList.toggle('is-nxt', m === k);
      if (m !== i && m !== k) { s.style.clipPath = 'inset(0 0 0 100%)'; return; }
    });
    const inc = slides[k], out = slides[i];
    const cut = (1 - p) * 100;
    inc.style.clipPath = d > 0 ? `inset(0 0 0 ${cut}%)` : `inset(0 ${cut}% 0 0)`;
    out.style.clipPath = 'inset(0)';
    (inc.querySelector('.ph') as HTMLElement).style.transform = `translateX(${d * (1 - p) * 28}%) scale(${1.12 - 0.08 * p})`;
    (out.querySelector('.ph') as HTMLElement).style.transform = `translateX(${-d * p * 14}%) scale(1)`;
    out.style.setProperty('--dim', String(p * 0.55));
    edge.style.opacity = p > 0 && p < 1 ? '1' : '0';
    edge.style.left = (d > 0 ? cut : 100 - cut) + '%';
  };
  const settle = (k: number) => {
    i = k; tgt = -1;
    slides.forEach((s, m) => {
      s.classList.toggle('is-cur', m === i); s.classList.remove('is-nxt');
      s.classList.toggle('on', m === i);
      s.style.clipPath = m === i ? 'inset(0)' : 'inset(0 0 0 100%)';
      s.style.setProperty('--dim', '0');
      (s.querySelector('.ph') as HTMLElement).style.transform = '';
    });
    edge.style.opacity = '0';
    dots.forEach((d, m) => d.setAttribute('aria-current', String(m === i)));
    if (cnum) cnum.textContent = String(i + 1).padStart(2, '0');
    slider.classList.remove('run'); void slider.offsetWidth;
    if (visible && !reduce) slider.classList.add('run');
  };
  const animate = (k: number, d: number, from: number, to: number, done: () => void) => {
    if (reduce) { done(); return; }
    busy = true; const t0 = performance.now(), dur = ANIM * Math.abs(to - from);
    const f = (t: number) => {
      const q = Math.min(1, (t - t0) / Math.max(dur, 1)), p = from + (to - from) * ease(q);
      paint(k, d, p);
      if (q < 1) requestAnimationFrame(f); else { busy = false; done(); }
    };
    requestAnimationFrame(f);
  };
  const go = (k: number, d?: number) => {
    k = (k + n) % n; if (busy || k === i) return;
    const dd = d ?? (k > i ? 1 : -1);
    slides[k].classList.add('on');
    animate(k, dd, 0, 1, () => settle(k));
  };
  const restart = () => { clearInterval(timer); if (!reduce) timer = window.setInterval(() => visible && !dragging && go(i + 1, 1), DUR); };
  dots.forEach((d, m) => d.addEventListener('click', () => { go(m); restart(); }));

  slider.addEventListener('pointerdown', (e) => {
    if (busy || (e.target as Element).closest('.dots')) return;
    dragging = true; moved = false; startX = e.clientX; dx = 0; tgt = -1;
    slider.setPointerCapture(e.pointerId); slider.classList.add('grab'); slider.classList.remove('run');
  });
  slider.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true;
    if (!moved) return;
    dir = dx < 0 ? 1 : -1;
    const k = (i + dir + n) % n;
    if (k !== tgt) { if (tgt >= 0) slides[tgt].classList.remove('on'); tgt = k; slides[k].classList.add('on'); }
    paint(k, dir, Math.min(1, Math.abs(dx) / slider.clientWidth));
  });
  const end = () => {
    if (!dragging) return;
    dragging = false; slider.classList.remove('grab');
    if (tgt < 0) { restart(); return; }
    const k = tgt, p = Math.min(1, Math.abs(dx) / slider.clientWidth);
    if (p > 0.12) animate(k, dir, p, 1, () => settle(k));
    else animate(k, dir, p, 0, () => settle(i));
    restart();
  };
  slider.addEventListener('pointerup', end);
  slider.addEventListener('pointercancel', end);
  slider.addEventListener('click', (e) => moved && e.preventDefault(), true);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!busy && !dragging) settle(i); }).observe(slider);
  settle(0); restart();
}

/* ---------- Counters ---------- */
const co = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const el = e.target as HTMLElement, end = +el.dataset.count!, t0 = performance.now();
  const f = (t: number) => { const k = clamp((t - t0) / 1600); el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 4)))); if (k < 1) requestAnimationFrame(f); };
  reduce ? (el.textContent = String(end)) : requestAnimationFrame(f);
  co.unobserve(el);
}), { threshold: 0.6 });
$$('[data-count]').forEach((el) => co.observe(el));

/* ---------- Öffnungsstatus (Europe/Berlin), live jede Minute ---------- */
const badges = $$('[data-open-status]');
const days = $('#days');
const paint = () => {
  const [d, m] = berlinNow();
  const s = openStatus(d, m), txt = statusText(s);
  badges.forEach((b) => {
    b.hidden = false;
    b.classList.toggle('closed', !s.open);
    b.classList.toggle('soon', s.open && s.soon);
    const t = b.querySelector('[data-t]'); if (t) t.textContent = txt;
  });
  if (days) $$('li', days).forEach((li, i) => li.classList.toggle('now', i === d));
};
if (badges.length || days) { paint(); setInterval(paint, 60_000); }

/* ---------- Karte erst nach Klick (DSGVO) ---------- */
$('#mapLoad')?.addEventListener('click', (e) => {
  const btn = e.currentTarget as HTMLElement, box = btn.closest('.map')!;
  const f = document.createElement('iframe');
  f.src = btn.dataset.src!; f.title = 'Google Maps – Standort'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
  box.innerHTML = ''; box.append(f);
});

/* ---------- Speisekarte ---------- */
const menu = $('#menu');
if (menu) {
  const dishes = $$('.dcard', menu), cats = $$('.mcat', menu);
  const q = $<HTMLInputElement>('#q')!, tV = $('#tV')!, tH = $('#tH')!, empty = $('#empty')!;

  /* Filter & Suche */
  const filt = () => {
    const s = q.value.trim().toLowerCase(), v = tV.getAttribute('aria-pressed') === 'true', h = tH.getAttribute('aria-pressed') === 'true';
    dishes.forEach((d) => { d.hidden = !((!v || d.dataset.v === '1') && (!h || d.dataset.h === '1') && (!s || d.dataset.s!.includes(s))); });
    let any = false;
    cats.forEach((c) => { const vis = $$('.dcard', c).some((d) => !d.hidden); c.hidden = !vis; any ||= vis; });
    empty.style.display = any ? 'none' : 'block';
    links.forEach((a) => { a.hidden = !!$(a.hash)?.hidden; });
    moveInd();
  };
  q.addEventListener('input', filt);
  [tV, tH].forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); filt(); }));

  /* Kategorien-Navigation: Indikator (nur transform), Scrollspy, Pfeile, Sticky-Status */
  const nav = $('#catnav')!, track = $('#cnTrack')!, ind = $('#cnInd')!;
  const links = $$<HTMLAnchorElement>('.cn-link', track);
  let active = links[0];
  const moveInd = () => {
    if (!active || active.hidden) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1';
    ind.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth / 100})`;
  };
  const setActive = (a: HTMLAnchorElement) => {
    if (a === active) return;
    active?.classList.remove('on'); active?.removeAttribute('aria-current');
    active = a; a.classList.add('on'); a.setAttribute('aria-current', 'true');
    moveInd();
    // nur scrollen, wenn der aktive Tab nicht vollständig sichtbar ist
    const l = a.offsetLeft, r = l + a.offsetWidth, vl = track.scrollLeft, vr = vl + track.clientWidth;
    if (l < vl + 24 || r > vr - 24) track.scrollTo({ left: l - track.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const a = links.find((x) => x.hash === '#' + e.target.id);
    if (a) setActive(a);
  }), { rootMargin: '-35% 0px -60% 0px' });
  cats.forEach((c) => spy.observe(c));
  links.forEach((a) => a.addEventListener('click', () => setActive(a)));
  $$('.cn-arr', nav).forEach((b) => b.addEventListener('click', () => {
    track.scrollBy({ left: (b.classList.contains('l') ? -1 : 1) * track.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  }));
  const edges = () => {
    nav.classList.toggle('can-l', track.scrollLeft > 4);
    nav.classList.toggle('can-r', track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };
  track.addEventListener('scroll', edges, { passive: true });
  addEventListener('resize', () => { edges(); moveInd(); });
  edges(); moveInd();
  // „klebt“ die Leiste oben? (dann unter den Header schieben, solange dieser sichtbar ist)
  const sentinel = $('.cn-sentinel');
  if (sentinel) new IntersectionObserver(([e]) => nav.classList.toggle('stuck', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);

  /* Detail-Karte (Sheet) */
  type It = { nr: string | null; name: string; desc: string | null; price: string; size: string | null; spicy: string | null; veg: boolean; sig: boolean; out: boolean; img: string | null; id: string; all: string[]; add: string[]; sauces: { k: string; name: string; spicy: string | null; info?: string }[] | null };
  const data: { cat: string; side: string | null; items: It[] }[] = JSON.parse($('#dishData')!.textContent || '[]');
  const sheet = $('#sheet')!, panel = $('.sheet-panel', sheet)!;
  const el = (id: string) => $('#' + id)!;
  let cur: HTMLElement | null = null, lastFocus: HTMLElement | null = null;
  const esc = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const fill = (d: HTMLElement) => {
    const c = data[+d.dataset.ci!], it = c.items[+d.dataset.di!];
    cur = d;
    const img = el('shImg') as HTMLImageElement;
    if (it.img) { img.src = it.img; img.alt = it.name; img.parentElement!.hidden = false; } else img.parentElement!.hidden = true;
    el('shNo').textContent = it.nr ? 'Nr. ' + it.nr : '';
    el('shCat').textContent = c.cat;
    el('shName').textContent = it.name + (it.size ? ' · ' + it.size : '');
    el('shDesc').textContent = it.desc ?? '';
    el('shDesc').hidden = !it.desc;
    const badges: string[] = [];
    if (it.sig) badges.push('<span class="tg s"><svg><use href="#i-flame"/></svg>Empfehlung</span>');
    if (it.veg) badges.push('<span class="tg v"><svg><use href="#i-leaf"/></svg>vegetarisch</span>');
    if (it.spicy) badges.push(`<span class="tg h"><svg><use href="#i-chili"/></svg>${esc(it.spicy)}</span>`);
    if (it.out) badges.push('<span class="tg o">Heute leider aus</span>');
    el('shBadges').innerHTML = badges.join('');
    el('shPrice').textContent = it.price;
    el('shSide').textContent = c.side ?? '';
    el('shSide').hidden = !c.side;
    const sc = el('shSauces');
    sc.innerHTML = it.sauces ? '<h4>Soße nach Wahl</h4><ul class="sauces3">' + it.sauces.map((x) => `<li><b>${esc(x.k)}</b><span>${esc(x.name ?? '')}${x.spicy ? ` <em>· ${esc(x.spicy)}</em>` : ''}${x.info ? `<small>${esc(x.info)}</small>` : ''}</span></li>`).join('') + '</ul>' : '';
    sc.hidden = !it.sauces;
    el('shAll').innerHTML = it.all.length ? it.all.map((x) => `<li>${esc(x)}</li>`).join('') : (it.sauces ? '<li class="none">Je nach Soße (siehe oben)</li>' : '<li class="none">Keine Angaben</li>');
    el('shAdd').innerHTML = it.add.length ? it.add.map((x) => `<li>${esc(x)}</li>`).join('') : (it.sauces ? '<li class="none">Je nach Soße (siehe oben)</li>' : '<li class="none">Keine</li>');
    panel.scrollTop = 0;
    // teilbarer Link auf das Gericht (ohne Scroll-Sprung)
    history.replaceState(null, '', '#' + it.id);
  };
  const visibleDishes = () => dishes.filter((d) => !d.hidden && !(d.closest(".mcat") as HTMLElement).hidden);
  const open = (d: HTMLElement) => {
    lastFocus = d; fill(d);
    sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add('open'));
    body.classList.add('lock'); ($('.sheet-x', sheet) as HTMLElement).focus();
  };
  const close = () => {
    sheet.classList.remove('open'); body.classList.remove('lock');
    setTimeout(() => { sheet.hidden = true; }, reduce ? 0 : 450);
    history.replaceState(null, '', location.pathname + location.search);
    lastFocus?.focus({ preventScroll: true });
  };
  const step = (k: number) => { const v = visibleDishes(), j = v.indexOf(cur!); const n2 = v[(j + k + v.length) % v.length]; if (n2) { fill(n2); lastFocus = n2; n2.scrollIntoView({ block: 'center', behavior: 'auto' }); } };
  dishes.forEach((d) => {
    d.addEventListener('click', () => open(d));
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(d); } });
  });
  $$('[data-close]', sheet).forEach((b) => b.addEventListener('click', close));
  addEventListener('keydown', (e) => {
    if (sheet.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') { // Fokus im Dialog halten
      const f = $$<HTMLElement>('button, a[href]', panel).filter((x) => x.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // Direktlink …/speisekarte/#gericht-40a → Gericht zeigen und Details öffnen
  const deep = location.hash.startsWith('#gericht-') ? $(location.hash) : null;
  if (deep && deep.classList.contains('dcard')) { deep.scrollIntoView({ block: 'center' }); setTimeout(() => open(deep), 300); }
  // Mobil: nach unten wischen zum Schließen
  let sy = 0, dy = 0;
  panel.addEventListener('touchstart', (e) => { sy = e.touches[0].clientY; dy = 0; }, { passive: true });
  panel.addEventListener('touchmove', (e) => { if (panel.scrollTop > 0) return; dy = Math.max(0, e.touches[0].clientY - sy); panel.style.transform = dy ? `translateY(${dy}px)` : ''; }, { passive: true });
  panel.addEventListener('touchend', () => { panel.style.transform = ''; if (dy > 110) close(); });
}

/* ---------- Motion v2: Überschriften, Staffelungen, Ornamente ---------- */
if (!reduce) {
  // 1) Überschriften: Vorhang-Reveal. Eigener Observer pro Element
  //    (mehrere Überschriften können denselben Eltern-Container haben).
  const hio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); hio.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  // .hscroll (horizontal gepinnt) hat eigene Bewegung → ausgenommen
  $$('main h2, .pagehero h1, .clock h3, .ticket h3')
    .filter((h) => !h.matches('[data-words], #burstH, #zoomH, .sheet *, .hscroll *'))
    .forEach((h) => { h.classList.add('hrv'); hio.observe(h); });

  // 2) Kicker-Linie wächst
  $$('main .kicker, .foot .kicker')
    .filter((k) => !k.matches('.hscroll *, .sheet *'))
    .forEach((k) => { k.classList.add('kw'); hio.observe(k); });

  // 3) Trenner-Ornamente zeichnen sich
  $$('svg.orn').forEach((o) => { o.classList.add('draw'); targets.set(o, o); io.observe(o); });

  // 4) Gestaffelte Elemente: was gemeinsam sichtbar wird, erscheint nacheinander
  const stag = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting).forEach((e, i) => {
      const el = e.target as HTMLElement, d = Math.min(i, 8) * 70;
      el.style.setProperty('--d', d + 'ms');
      el.classList.add('in');
      stag.unobserve(el);
      // danach aufräumen, damit Hover-Übergänge nicht verzögert sind
      setTimeout(() => { el.classList.remove('sti', 'in'); el.style.removeProperty('--d'); }, d + 1000);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.dcard, .rv, .nums > div, .foot .cols > div, .slots > div, .days li')
    .forEach((el) => { el.classList.add('sti'); stag.observe(el); });
}

/* Videos: nur abspielen, wenn sichtbar; Standbild bleibt darunter als Fallback */
if (!reduce) {
  const vids = $$<HTMLVideoElement>('video[data-vid]');
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting) {
      if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
      v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach((v) => {
    v.addEventListener('playing', () => v.classList.add('on'), { once: true });
    vio.observe(v);
  });
}

/* Speisekarte: Schnell-Button „Übersicht“ erscheint, sobald die Übersicht aus dem Bild ist */
const ov = $('#uebersicht'), toOv = $('#toOv');
if (ov && toOv) {
  new IntersectionObserver(([e]) => toOv.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(ov);
  const foot2 = $('.foot');
  if (foot2) new IntersectionObserver(([e]) => toOv.classList.toggle('near-foot', e.isIntersecting)).observe(foot2);
}

/* Bewertungen (mobil als Wisch-Leiste): Punkte zeigen die aktuelle Karte */
const rvList = $('.rv-list'), rvDots = $$('.rv-dots i');
if (rvList && rvDots.length) {
  let rvT = 0;
  rvList.addEventListener('scroll', () => {
    cancelAnimationFrame(rvT);
    rvT = requestAnimationFrame(() => {
      const cards = $$('.rv', rvList), x = rvList.scrollLeft + rvList.clientWidth / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - x); if (d < bd) { bd = d; best = i; } });
      rvDots.forEach((d, i) => d.classList.toggle('on', i === best));
    });
  }, { passive: true });
}
