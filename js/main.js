// ============================================================
// main.js — site 3 (synthesis). Single Lenis→gsap.ticker loop from
// the start (lesson from tonight's jank-fix on site 1) — no retrofit needed.
// ============================================================
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;

document.body.classList.remove('loading');

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (Lenis && !REDUCED) {
    try {
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 1.4 });
      window.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } catch (e) { console.warn('[lenis] disabled', e); }
  }

  // reveals + count-up
  function animateCount(el){
    const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    const suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
    if (REDUCED){ el.textContent = pre + target.toFixed(dec) + suf; return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.1, ease: 'power2.out',
      onUpdate: () => { el.textContent = pre + o.v.toFixed(dec) + suf; },
      onComplete: () => { el.textContent = pre + target.toFixed(dec) + suf; } });
  }
  function fireCounts(root){ root.querySelectorAll('[data-count]').forEach((c) => { if (!c.dataset.done){ c.dataset.done='1'; animateCount(c);} }); }

  document.querySelectorAll('.rv').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 88%',
      onEnter: () => { el.classList.add('in'); fireCounts(el); } });
  });
  document.querySelectorAll('#otanStats .cell').forEach((c) => {
    ScrollTrigger.create({ trigger: c, start: 'top 90%', onEnter: () => fireCounts(c) });
  });

  // giant-stat hero sequence — cross-fade slides + count-up as each becomes active
  const slides = [...document.querySelectorAll('.ss-slide')];
  const dots = [...document.querySelectorAll('.ss-dots .d')];
  let activeSlide = 0;
  fireCounts(slides[0]);
  ScrollTrigger.create({
    trigger: '.statshero', start: 'top top', end: 'bottom bottom', scrub: false,
    onUpdate: (self) => {
      const idx = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
      if (idx !== activeSlide){
        slides[activeSlide].classList.remove('in');
        slides[idx].classList.add('in');
        if (dots[activeSlide]) dots[activeSlide].classList.remove('active');
        if (dots[idx]) dots[idx].classList.add('active');
        activeSlide = idx;
        fireCounts(slides[idx]);
      }
    }
  });

  // index nav active chapter
  const ids = ['stats','otan','early','compare','method','about','contact'];
  const idxDots = [...document.querySelectorAll('.idx .ix')];
  ids.forEach((id, i) => {
    const el = document.getElementById(id); if (!el) return;
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) idxDots.forEach((d,j)=>d.classList.toggle('active', j===i)); } });
  });

  document.fonts && document.fonts.ready && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
  // graceful fallback: show everything, no scroll-driven motion
  document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
  document.querySelectorAll('.ss-slide').forEach((s) => s.classList.add('in'));
  document.querySelectorAll('[data-count]').forEach((el) => {
    const t = parseFloat(el.dataset.count), d = parseInt(el.dataset.dec||'0',10);
    el.textContent = (el.dataset.prefix||'') + t.toFixed(d) + (el.dataset.suffix||'');
  });
}

// nav scroll state + progress bar
const nav = document.getElementById('nav'), prog = document.getElementById('prog');
function onScroll(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (nav) nav.classList.toggle('scrolled', y > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (prog) prog.style.width = (h > 0 ? (y / h * 100) : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

// smooth-scroll anchors
document.querySelectorAll('a[data-scroll]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (!id || id.charAt(0) !== '#') return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 10;
    if (window.lenis) window.lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top, behavior: 'smooth' });
  });
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// pitch modal
const modal=document.getElementById('pitchModal');
const modalFrame=document.getElementById('modalFrame');
const modalTitle=document.getElementById('modalTitle');
function openModal(pdf,title){
  if(!modal||!pdf) return;
  if(modalTitle) modalTitle.textContent=title||'Разбор';
  modalFrame.src=pdf+'#view=FitH';
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function closeModal(){
  if(!modal) return;
  modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  setTimeout(()=>{ modalFrame.src='about:blank'; },260);
}
document.querySelectorAll('.pitch-card').forEach((c)=>c.addEventListener('click',()=>openModal(c.dataset.pdf,c.dataset.title)));
if(modal){
  modal.querySelectorAll('[data-close]').forEach((el)=>el.addEventListener('click',closeModal));
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'&&modal.classList.contains('open')) closeModal(); });
}
