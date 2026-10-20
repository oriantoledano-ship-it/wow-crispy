(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || root.getAttribute('data-motion') === 'off';

  /* where the page opens: a refresh starts at the top, a link to a section lands there once,
     and the back button returns to the last position */
  var navType = (function () {
    var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (n) return n.type;
    return performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate';
  })();
  var posKey = 'wow-y:' + location.pathname, touched = false;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (ev) { addEventListener(ev, function () { touched = true; }, { passive: true, once: true }); });
  addEventListener('pagehide', function () { try { sessionStorage.setItem(posKey, String(Math.round(scrollY))); } catch (e) {} });
  function initPosition() {
    var t = navType !== 'reload' && location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (location.hash) try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (t) { setTimeout(function () { t.scrollIntoView(); }, 60); return; }
    var y = 0;
    if (navType === 'back_forward') { try { y = parseInt(sessionStorage.getItem(posKey), 10) || 0; } catch (e) {} }
    window.scrollTo(0, y);
    if (document.readyState !== 'complete') addEventListener('load', function () { if (!touched) window.scrollTo(0, y); }, { once: true });
  }

  /* header + drawer */
  function initHeader() {
    var hdr = $('#hdr'), burger = $('.burger'), drawer = $('#drawer');
    function onScroll() { hdr.classList.toggle('is-stuck', scrollY > 8); }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    function setOpen(open) {
      hdr.classList.toggle('is-open', open);
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
      drawer.setAttribute('aria-hidden', !open);
      root.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setOpen(!drawer.classList.contains('is-open')); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setOpen(false); burger.focus(); } });
    addEventListener('resize', function () { if (innerWidth > 900 && drawer.classList.contains('is-open')) setOpen(false); });
  }

  /* in-page links scroll without leaving a #hash in the address */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var el = id === 'top' ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      setTimeout(function () {
        if (el === document.body) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      }, 10);
    });
  }

  /* scroll reveals */
  function initReveal() {
    var els = $$('.rv');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transitionDelay = (n++ % 4) * 80 + 'ms';
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ticker: one set of words, duplicated, moved by the exact width of one set */
  function initTicker() {
    var track = $('.ticker-track');
    if (!track) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var setW = track.scrollWidth + gap;
    track.innerHTML += track.innerHTML;
    track.style.setProperty('--tick', setW + 'px');
  }

  /* coating compare: drag anywhere on the photo, or use the arrow keys */
  function initCompare() {
    var box = $('#cmp');
    if (!box) return;
    var range = $('.cmp-range', box), top = $('.cmp-top', box), topImg = $('.cmp-top img', box), handle = $('.cmp-handle', box);
    var dragging = false, hinted = false, raf = 0;
    /* transforms only, so moving the split never repaints the photos */
    function set(p) {
      p = Math.max(0, Math.min(100, p));
      top.style.transform = 'translateX(' + p + '%)';
      topImg.style.transform = 'translateX(' + (-p) + '%)';
      handle.style.transform = 'translateX(' + p + '%)';
      range.value = Math.round(p);
    }
    function fromEvent(e) {
      var r = box.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * 100;
    }
    box.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      dragging = true; hinted = true; cancelAnimationFrame(raf);
      box.classList.add('is-drag');
      box.setPointerCapture(e.pointerId);
      set(fromEvent(e));
    });
    box.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      set(fromEvent(e));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) {
      box.addEventListener(ev, function () { dragging = false; box.classList.remove('is-drag'); });
    });
    /* touch: follow a horizontal finger, let vertical swipes scroll the page */
    var sx = 0, sy = 0, mode = null;
    box.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; mode = null; }, { passive: true });
    box.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!mode) mode = Math.abs(t.clientX - sx) > Math.abs(t.clientY - sy) ? 'x' : 'y';
      if (mode === 'x') { hinted = true; set(fromEvent(t)); }
    }, { passive: true });
    range.addEventListener('input', function () { hinted = true; set(+range.value); });
    set(50);
    /* a short nudge the first time it comes into view, so it's clear it moves */
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || hinted) return;
      io.disconnect();
      var t0 = null, keys = [50, 34, 66, 50], dur = 1700;
      function step(t) {
        if (hinted) return;
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), seg = k * 3, i = Math.min(2, Math.floor(seg)), f = seg - i;
        f = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        set(keys[i] + (keys[i + 1] - keys[i]) * f);
        if (k < 1) raf = requestAnimationFrame(step);
      }
      setTimeout(function () { raf = requestAnimationFrame(step); }, 400);
    }, { threshold: 0.6 });
    io.observe(box);
  }

  /* map: inserted only once the visitor pauses near it, so scrolling past never stutters */
  function initMap() {
    var box = $('.map[data-map]');
    if (!box) return;
    var done = false, near = false, idle = null;
    function load() {
      if (done) return; done = true;
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-map');
      f.title = 'מפת הגעה לוואו קריספי';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.appendChild(f);
    }
    function onScroll() {
      if (done || !near) return;
      clearTimeout(idle);
      idle = setTimeout(load, 160);
    }
    if (!('IntersectionObserver' in window)) return load();
    new IntersectionObserver(function (en) { near = en[0].isIntersecting; if (near) onScroll(); else clearTimeout(idle); }, { rootMargin: '350px 0px' }).observe(box);
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* hours: mark today and say whether it's open right now (Israel time) */
  function initHours() {
    var rows = $$('.hours tr[data-days]'), badge = $('[data-open]');
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    } catch (e) { return; }
    var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    var mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    var spans = { 0: [810, 1440], 1: [810, 1440], 2: [810, 1440], 3: [810, 1440], 4: [810, 1440], 6: [1290, 1440] };
    rows.forEach(function (r) { if (r.getAttribute('data-days').split(',').indexOf(String(day)) > -1) r.classList.add('is-today'); });
    if (!badge || day < 0) return;
    var s = spans[day], open = s && mins >= s[0] && mins < s[1];
    badge.textContent = open ? 'פתוח עכשיו · עד 00:00' : 'סגור עכשיו';
    badge.classList.toggle('is-open', !!open);
    badge.hidden = false;
  }

  /* phone order bar appears after the hero */
  function initMcta() {
    var hero = $('.hero'), on = false;
    if (!hero) return;
    function onScroll() {
      var show = scrollY > hero.offsetHeight * 0.7;
      if (show !== on) { on = show; document.body.classList.toggle('mcta-on', on); }
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function boot() {
    $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
    initPosition();
    initHeader();
    initAnchors();
    initReveal();
    initTicker();
    initCompare();
    initMap();
    initHours();
    initMcta();
    root.setAttribute('data-ready', '');
    var hero = $('.hero');
    if (hero) setTimeout(function () { hero.classList.add('is-live'); }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
