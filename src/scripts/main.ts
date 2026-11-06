const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const body = document.body;

/* ---------- Intro curtain (1× pro Sitzung) ---------- */
const curtain = $('#curtain');
let seen = false;
try { seen = sessionStorage.getItem('ctw-intro') === '1'; sessionStorage.setItem('ctw-intro', '1'); } catch {}
if (curtain && !seen && !reduce) {
  curtain.hidden = false;
  body.classList.add('lock', 'intro');
  const go = () => {
    curtain.classList.add('open');
    setTimeout(() => { body.classList.remove('lock'); body.classList.add('ready'); }, 1300);
    setTimeout(() => curtain.remove(), 2400);
  };
  document.readyState === 'complete' ? go() : addEventListener('load', go, { once: true });
  setTimeout(() => !curtain.classList.contains('open') && go(), 2500);
} else {
  curtain?.remove();
  requestAnimationFrame(() => body.classList.add('ready'));
}

/* ---------- Header ---------- */
const hdr = $('#hdr')!;
let lastY = scrollY;
const onHeader = () => {
  const y = scrollY;
  hdr.classList.toggle('solid', y > 40);
  const hide = y > 400 && y > lastY && !body.classList.contains('menu-open');
  hdr.classList.toggle('hide', hide);
  body.classList.toggle('hdr-on', !hide);
  lastY = y;
};
addEventListener('scroll', onHeader, { passive: true });
onHeader();

/* ---------- Mobile Aktionsleiste ---------- */
const mbar = $('#mbar');
const foot = $('.foot');
if (mbar) addEventListener('scroll', () => {
  const nearFoot = foot ? foot.getBoundingClientRect().top < innerHeight * 0.6 : false;
  mbar.classList.toggle('show', scrollY > 300 && !nearFoot);
}, { passive: true });

/* ---------- Mobile menu ---------- */
const mnav = $('#mnav')!, openBtn = $('#menuOpen')!, closeBtn = $('#menuClose')!;
const setMenu = (open: boolean) => {
  mnav.classList.toggle('open', open);
  mnav.setAttribute('aria-hidden', String(!open));
  openBtn.setAttribute('aria-expanded', String(open));
  body.classList.toggle('lock', open);
  body.classList.toggle('menu-open', open);
  if (open) closeBtn.focus();
};
openBtn.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
$$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

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
  const words = $$('.w', stmt);
  scrollers.push(() => {
    const r = stmt.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3));
    words.forEach((w, i) => w.classList.toggle('on', i / words.length < p));
  });
});

/* #2 Burst-Galerie: --t 0 (Stapel) → 1 (aufgefächert), folgt der Scrollbar in beide Richtungen */
const burst = $('#burst'), bpin = $('#burstPin');
if (burst && bpin) scrollers.push(() => {
  const r = burst.getBoundingClientRect();
  // startet schon, wenn die Sektion von unten ins Bild kommt (nicht erst beim Pinnen)
  // Start beim Hereinkommen, voll aufgefächert kurz nach dem Pinnen (≈ 0,3 Viewport), danach kurz halten
  const t = reduce ? 1 : clamp((innerHeight * 0.9 - r.top) / (innerHeight * 1.2));
  const e = 1 - Math.pow(1 - t, 3);
  bpin.style.setProperty('--t', e.toFixed(4));
});

const zs = $('#zoom'), zp = $('#zpin');
if (zs && zp) scrollers.push(() => {
  const r = zs.getBoundingClientRect(), t = clamp(-r.top / (r.height - innerHeight));
  zp.style.setProperty('--r', 14 + t * t * 80 + '%');
  zp.style.setProperty('--s', String(1.3 - t * 0.3));
  zp.style.setProperty('--po', String(clamp(1 - t * 3)));
  zp.style.setProperty('--o', String(clamp((t - 0.55) * 3)));
});

const hs = $('#signature'), track = $('#track'), prog = $('#prog');
if (hs && track && prog) scrollers.push(() => {
  if (innerWidth <= 860) return;
  const r = hs.getBoundingClientRect(), max = track.scrollWidth - innerWidth;
  const t = clamp(-r.top / (r.height - innerHeight));
  track.style.transform = `translateX(${-t * max}px)`;
  prog.style.width = t * 100 + '%';
});

const pars = $$('[data-par]');
if (pars.length && !reduce) scrollers.push(() => pars.forEach((el) => {
  const r = el.getBoundingClientRect();
  el.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * +el.dataset.par!}px)`;
}));

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

/* ---------- Öffnungsstatus (Europe/Berlin) ---------- */
const st = $('#st');
if (st) {
  const parts = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === 'weekday')!.value.replace('.', '');
  const m = +parts.find((p) => p.type === 'hour')!.value * 60 + +parts.find((p) => p.type === 'minute')!.value;
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  $$('#days li')[days.indexOf(wd)]?.classList.add('now');
  const open = wd !== 'Mo' && ((m >= 630 && m < 900) || (m >= 1020 && m < 1290));
  if (!open) { st.classList.add('closed'); $('span', st)!.textContent = 'Gerade geschlossen'; }
}

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
  const dishes = $$('.dish', menu), cats = $$('.mcat', menu), chips = $$<HTMLAnchorElement>('.chip');
  const q = $<HTMLInputElement>('#q')!, tV = $('#tV')!, tH = $('#tH')!, empty = $('#empty')!;
  const filt = () => {
    const s = q.value.trim().toLowerCase(), v = tV.getAttribute('aria-pressed') === 'true', h = tH.getAttribute('aria-pressed') === 'true';
    dishes.forEach((d) => {
      const ok = (!v || d.dataset.v === '1') && (!h || d.dataset.h === '1') && (!s || d.dataset.s!.includes(s));
      d.hidden = !ok;
    });
    let any = false;
    cats.forEach((c) => { const vis = $$('.dish', c).some((d) => !d.hidden); c.hidden = !vis; any ||= vis; });
    empty.style.display = any ? 'none' : 'block';
  };
  q.addEventListener('input', filt);
  [tV, tH].forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); filt(); }));

  // Scrollspy
  const bar = $('.catbar .wrap')!;
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    chips.forEach((c) => {
      const on = c.hash === '#' + e.target.id;
      c.classList.toggle('on', on);
      if (on) bar.scrollTo({ left: c.offsetLeft - 40, behavior: reduce ? 'auto' : 'smooth' });
    });
  }), { rootMargin: '-40% 0px -55% 0px' });
  cats.forEach((c) => spy.observe(c));

  // Detail-Karte (Sheet) beim Klick auf ein Gericht
  type It = { nr: string | null; name: string; desc: string | null; price: string; size: string | null; spicy: string | null; veg: boolean; sig: boolean; out: boolean; img: string | null; all: string[]; add: string[]; sauces: { k: string; name: string; spicy: string | null }[] | null };
  const data: { cat: string; side: string | null; img: string | null; items: It[] }[] = JSON.parse($('#dishData')!.textContent || '[]');
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
    if (it.sig) badges.push('<span class="tg s"><svg><use href="#i-flame"/></svg>Empfehlung des Hauses</span>');
    if (it.veg) badges.push('<span class="tg v"><svg><use href="#i-leaf"/></svg>vegetarisch</span>');
    if (it.spicy) badges.push(`<span class="tg h"><svg><use href="#i-chili"/></svg>${esc(it.spicy)}</span>`);
    if (it.out) badges.push('<span class="tg o">Heute leider aus</span>');
    el('shBadges').innerHTML = badges.join('');
    el('shPrice').textContent = it.price;
    el('shSide').textContent = c.side ?? '';
    const sc = el('shSauces');
    sc.innerHTML = it.sauces ? '<h3>Soße nach Wahl</h3><ul class="chips sauces2">' + it.sauces.map((x) => `<li><b>${esc(x.k)}</b>${esc(x.name ?? '')}${x.spicy ? ` <em>· ${esc(x.spicy)}</em>` : ''}</li>`).join('') + '</ul>' : '';
    sc.hidden = !it.sauces;
    el('shAll').innerHTML = it.all.length ? it.all.map((x) => `<li>${esc(x)}</li>`).join('') : '<li class="none">Keine Angaben</li>';
    el('shAdd').innerHTML = it.add.length ? it.add.map((x) => `<li>${esc(x)}</li>`).join('') : '<li class="none">Keine</li>';
    panel.scrollTop = 0;
  };
  const visibleDishes = () => dishes.filter((d) => !d.hidden && !d.closest('.mcat')!.hidden);
  const open = (d: HTMLElement) => {
    lastFocus = d; fill(d);
    sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add('open'));
    body.classList.add('lock'); ($('.sheet-x', sheet) as HTMLElement).focus();
  };
  const close = () => {
    sheet.classList.remove('open'); body.classList.remove('lock');
    setTimeout(() => { sheet.hidden = true; }, reduce ? 0 : 450);
    lastFocus?.focus();
  };
  const step = (k: number) => { const v = visibleDishes(), j = v.indexOf(cur!); const n2 = v[(j + k + v.length) % v.length]; if (n2) { fill(n2); n2.scrollIntoView({ block: 'center', behavior: 'auto' }); } };
  dishes.forEach((d) => {
    d.addEventListener('click', () => open(d));
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(d); } });
  });
  $$('[data-close]', sheet).forEach((b) => b.addEventListener('click', close));
  el('shPrev').addEventListener('click', () => step(-1));
  el('shNext').addEventListener('click', () => step(1));
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
  // Mobil: nach unten wischen zum Schließen
  let sy = 0, dy = 0;
  panel.addEventListener('touchstart', (e) => { sy = e.touches[0].clientY; dy = 0; }, { passive: true });
  panel.addEventListener('touchmove', (e) => { if (panel.scrollTop > 0) return; dy = Math.max(0, e.touches[0].clientY - sy); panel.style.transform = dy ? `translateY(${dy}px)` : ''; }, { passive: true });
  panel.addEventListener('touchend', () => { panel.style.transform = ''; if (dy > 110) close(); });
}
