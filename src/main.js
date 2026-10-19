import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { content, DEFAULT_VERSION } from './content.js';
import { renderHeroLede, renderStatement, renderWork, renderRoles, renderToolkit, findPlaceholders } from './render.js';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const nav = $('#nav');
const navLinks = $('#nav-links');
const burger = $('#burger');
let lenis = null;

/* ---------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */

// Wrap every word of an element in a masked span so it can slide up.
function splitWords(el) {
  const out = [];
  const walk = (node, target) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(' ')); return; }
          const mask = document.createElement('span');
          mask.className = 'sl';
          const inner = document.createElement('span');
          inner.textContent = part;
          mask.appendChild(inner);
          target.appendChild(mask);
          out.push(inner);
        });
      } else if (child.nodeName === 'BR') {
        target.appendChild(document.createElement('br'));
      } else if (child.nodeType === 1) {
        const clone = child.cloneNode(false);
        target.appendChild(clone);
        walk(child, clone);
      }
    });
  };
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  const frag = document.createDocumentFragment();
  walk(el, frag);
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.appendChild(frag);
  return out;
}

// Wrap statement words so opacity can be scrubbed with scroll.
function splitStatement(el) {
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  let inPh = false;
  return text.split(' ').map((w) => {
    const s = document.createElement('span');
    if (w.startsWith('[')) inPh = true;
    s.className = isLocal && inPh ? 'w ph' : 'w';
    if (w.endsWith(']')) inPh = false;
    s.textContent = w;
    el.appendChild(s);
    el.appendChild(document.createTextNode(' '));
    return s;
  });
}

/* ---------------------------------------------------------------
   Resume versions (Current / Product)
---------------------------------------------------------------- */
const LS_KEY = 'resume-version';
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const isValid = (v) => v === 'current' || v === 'product';
const vtoggle = $('#vtoggle');
let version = DEFAULT_VERSION;
let dynCtx = null; // gsap context holding animations for the swappable sections

// ?v= in the URL wins, then localStorage, then the default
function resolveVersion() {
  const q = new URLSearchParams(location.search).get('v');
  if (isValid(q)) return q;
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (isValid(stored)) return stored;
  } catch (e) { /* storage unavailable */ }
  return DEFAULT_VERSION;
}

function renderVersion(next) {
  const v = content[next];
  const opts = { highlight: isLocal };
  $('[data-swap="heroLede"]').innerHTML = renderHeroLede(v, opts);
  $('[data-swap="statement"]').innerHTML = renderStatement(v, opts);
  $('[data-swap="work"]').innerHTML = renderWork(v, opts);
  $('[data-swap="roles"]').innerHTML = renderRoles(v, opts);
  $('[data-swap="toolkit"]').innerHTML = renderToolkit(v);
  $$('[data-resume]').forEach((a) => a.setAttribute('href', v.resume));
  document.documentElement.dataset.version = next;

  // First work row starts open
  const first = $('.work-row');
  if (first) {
    first.classList.add('open');
    $('.work-head', first).setAttribute('aria-expanded', 'true');
  }
}

function syncToggle(next) {
  vtoggle.dataset.active = next;
  $$('button', vtoggle).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === next)));
}

function reportPlaceholders() {
  if (!isLocal) return;
  const list = findPlaceholders(content.product);
  if (!list.length) { console.info('[resume] Product copy has no unfilled placeholders.'); return; }
  console.groupCollapsed(`[resume] ${list.length} unfilled placeholder${list.length === 1 ? '' : 's'} in Product copy`);
  console.table(list);
  console.groupEnd();
}

// Crossfade + height morph between versions. Containers fully above the viewport
// are resized instantly with scroll compensation so the page never jumps.
function switchVersion(next) {
  if (next === version || !isValid(next)) return;
  version = next;
  try { localStorage.setItem(LS_KEY, next); } catch (e) { /* ignore */ }
  const url = new URL(location.href);
  url.searchParams.set('v', next);
  history.replaceState(null, '', url);
  syncToggle(next);

  if (reduce) { renderVersion(next); return; }

  const els = $$('[data-swap]');
  const oldH = els.map((el) => el.offsetHeight);
  els.forEach((el, i) => { el.style.height = oldH[i] + 'px'; el.style.overflow = 'hidden'; });

  gsap.to(els, {
    opacity: 0,
    duration: 0.22,
    ease: 'power2.in',
    onComplete: () => {
      dynCtx?.revert();
      renderVersion(next);

      const newH = els.map((el) => {
        el.style.height = 'auto';
        const h = el.offsetHeight;
        return h;
      });

      els.forEach((el, i) => {
        const above = el.getBoundingClientRect().bottom < 0;
        if (above) {
          // Off-screen above: resize instantly and keep the visible content where it was
          const delta = newH[i] - oldH[i];
          el.style.height = ''; el.style.overflow = ''; el.style.opacity = '';
          if (delta) {
            if (lenis) lenis.scrollTo(lenis.scroll + delta, { immediate: true, force: true });
            else window.scrollBy(0, delta);
          }
          return;
        }
        gsap.fromTo(el, { height: oldH[i], opacity: 0 }, {
          height: newH[i],
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          clearProps: 'height,overflow,opacity',
          onComplete: () => ScrollTrigger.refresh(),
        });
      });

      buildDynamicAnimations();
      ScrollTrigger.refresh();
    },
  });
}

function initVersionToggle() {
  // Let the thumb jump to its starting position without animating on first paint
  requestAnimationFrame(() => requestAnimationFrame(() => vtoggle.classList.remove('init')));
  $$('button', vtoggle).forEach((b) => b.addEventListener('click', () => switchVersion(b.dataset.version)));
}

/* ---------------------------------------------------------------
   Always-on behaviour (works with or without motion)
---------------------------------------------------------------- */
function initNavBasics() {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      if (lenis) {
        lenis.start();
        lenis.scrollTo(id === '#top' ? 0 : target, { offset: id === '#top' ? 0 : -40, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Work accordion (delegated, because the rows are re-rendered when the version changes)
  $('[data-swap="work"]').addEventListener('click', (e) => {
    const head = e.target.closest('.work-head');
    if (!head) return;
    const row = head.closest('.work-row');
    const open = row.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
    setTimeout(() => ScrollTrigger.refresh(), 700);
  });
}

// Scale the live-preview iframes so a 1280px page fits its frame
function initPreviews() {
  const views = $$('.frame-view');
  const fit = () => views.forEach((v) => v.style.setProperty('--s', (v.clientWidth / 1280).toFixed(4)));
  fit();
  new ResizeObserver(fit).observe(document.body);
}

// Typing loop for the Sales Agent mock
function initMockTyping() {
  const el = $('#mock-typing');
  if (!el) return;
  const prompts = ['Prep me for my 3pm meeting', 'Who did I last speak to at…', 'Show my pipeline snapshot', 'What are my CRM totals?'];
  if (reduce) { el.textContent = prompts[0]; return; }
  let p = 0, c = 0, del = false;
  const tick = () => {
    const word = prompts[p];
    c += del ? -1 : 1;
    el.textContent = word.slice(0, c);
    let wait = del ? 28 : 55;
    if (!del && c === word.length) { wait = 1600; del = true; }
    else if (del && c === 0) { del = false; p = (p + 1) % prompts.length; wait = 400; }
    setTimeout(tick, wait);
  };
  tick();
}

/* ---------------------------------------------------------------
   Motion
---------------------------------------------------------------- */
function initSmoothScroll() {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initMagnetic() {
  if (!finePointer) return;
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.3);
      y((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('mouseleave', () => { x(0); y(0); });
  });
}

function initTilt() {
  if (!finePointer) return;
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * 14, rotateX: -py * 14, duration: 0.5, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
  });
}

function initNavScroll() {
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hidden', y > last && y > 400 && !navLinks.classList.contains('open'));
      navLinks.classList.toggle('hidden', nav.classList.contains('hidden'));
      last = y;
    },
  });

  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  $$('[data-link]').forEach((link) => {
    const sec = $(link.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('active', self.isActive),
    });
  });
}

function initScrollAnimations() {
  // Section headings: words slide up through a mask
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 115,
      rotate: 4,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Generic reveals
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 48,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Counters
  $$('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    el.textContent = '0' + suffix;
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // Cert cards
  gsap.from('.cert', {
    y: 80,
    opacity: 0,
    rotate: 3,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.cert-row', start: 'top 85%' },
  });

  // Contact: big mail link slides up
  gsap.from('.contact-mail', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.contact-mail', start: 'top 92%' } });

  // Hero parallax
  gsap.to('.portrait-img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.badge', { y: -90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

// Animations for the sections that change with the version. Kept in a gsap
// context so they can be reverted and rebuilt after a switch.
function buildDynamicAnimations() {
  dynCtx = gsap.context(() => {
    // About statement: scrub word opacity with scroll
    const statement = $('#statement');
    if (statement) {
      const words = splitStatement(statement);
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: statement, start: 'top 82%', end: 'bottom 50%', scrub: true },
      });
    }

    // Work rows: rule lines draw in, titles rise
    $$('.work-line').forEach((line) => {
      gsap.from(line, { scaleX: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: line, start: 'top 92%' } });
    });
    $$('.work-head').forEach((head) => {
      gsap.from(head.children, {
        y: 36,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: head, start: 'top 92%' },
      });
    });

    // Roles reveal, then bullets cascade
    $$('.role').forEach((role) => {
      gsap.from(role, { y: 48, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: role, start: 'top 90%' } });
      gsap.from($$('li', role), {
        x: -24,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: $('ul', role), start: 'top 88%' },
      });
    });

    // Skill chips pop in
    $$('.skill-group').forEach((group) => {
      gsap.from($$('.chips span', group), {
        y: 24,
        scale: 0.85,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.6)',
        stagger: 0.03,
        scrollTrigger: { trigger: group, start: 'top 88%' },
      });
    });
  });
}

// Marquee that speeds up with scroll velocity and flips with direction
function initMarquee() {
  const row = $('#marquee');
  const track = $('.marquee-track', row);
  if (!track) return;
  track.innerHTML += track.innerHTML + track.innerHTML + track.innerHTML;
  let x = 0;
  let dir = -1;
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : 0;
    if (Math.abs(v) > 0.2) dir = v > 0 ? -1 : 1;
    x += dir * (0.7 + Math.min(Math.abs(v), 40) * 0.5);
    const half = track.scrollWidth / 4;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
}

function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('[data-hero="line"]', { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.12 }, 0)
    .from('.portrait', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 24px 24px)', duration: 1.5, ease: 'expo.inOut' }, 0.05)
    .from('.portrait-img', { scale: 1.35, duration: 1.8 }, 0.05)
    .from('[data-hero="fade"]', { y: 28, opacity: 0, duration: 1, stagger: 0.08 }, 0.35)
    .from('.nav, .nav-links', { opacity: 0, duration: 1 }, 0.5)
    .from('.hero-meta', { opacity: 0, duration: 1 }, 0.4);
  return tl;
}

function runLoader() {
  const loader = $('#loader');
  const num = $('#loader-num');
  const bar = $('#loader-bar');
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    gsap.to(loader, {
      yPercent: -100,
      duration: 1,
      ease: 'expo.inOut',
      onComplete: () => loader.remove(),
    });
    gsap.delayedCall(0.45, playIntro);
  };

  const obj = { v: 0 };
  gsap.to(obj, {
    v: 100,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => { num.textContent = Math.round(obj.v); bar.style.width = obj.v + '%'; },
    onComplete: finish,
  });
  // Failsafe so a throttled tab can never leave the loader stuck
  setTimeout(() => { if (!done) { done = true; loader.remove(); playIntro().progress(1); } }, 6000);
}

/* ---------------------------------------------------------------
   Boot
---------------------------------------------------------------- */
version = resolveVersion();
renderVersion(version);
syncToggle(version);
reportPlaceholders();

initNavBasics();
initVersionToggle();
initPreviews();
initMockTyping();

if (reduce) {
  $('#loader')?.remove();
} else {
  initSmoothScroll();
  initMagnetic();
  initTilt();
  initNavScroll();
  initScrollAnimations();
  buildDynamicAnimations();
  initMarquee();
  runLoader();

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  document.fonts?.ready.then(refresh);
}
