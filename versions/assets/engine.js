/* Portfolio interactif · moteur commun (langue, panneaux, son, capture).
   Aucune dépendance. Le contenu existe dans la page sans JavaScript ; ce fichier ne fait que l'ouvrir en panneaux. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var KEY = 'jg-lang';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Langue ---------- */
  var descFr = d.querySelector('meta[name="description"]') ? d.querySelector('meta[name="description"]').getAttribute('content') : '';
  var descEn = 'Joséphine Goudji, digital marketing project manager: SEO/GEO, content creation and digital growth. Two years in SEO at Leroy Merlin France. Priority: a V.I.E in Asia or the United States.';
  var btnFr = d.getElementById('lang-fr'), btnEn = d.getElementById('lang-en');
  function setLang(l, save) {
    root.setAttribute('data-lang', l); root.setAttribute('lang', l);
    if (btnFr) btnFr.setAttribute('aria-pressed', l === 'fr' ? 'true' : 'false');
    if (btnEn) btnEn.setAttribute('aria-pressed', l === 'en' ? 'true' : 'false');
    var m = d.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', l === 'en' ? descEn : descFr);
    d.title = l === 'en' ? 'Joséphine Goudji · SEO/GEO, content & digital growth' : 'Joséphine Goudji · SEO/GEO, contenu & développement digital';
    d.querySelectorAll('a[data-href-fr]').forEach(function (a) { a.setAttribute('href', a.getAttribute(l === 'en' ? 'data-href-en' : 'data-href-fr')); });
    d.querySelectorAll('img[data-alt-en]').forEach(function (i) { i.alt = i.getAttribute(l === 'en' ? 'data-alt-en' : 'data-alt-fr') || i.alt; });
    if (save) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  }
  setLang(root.getAttribute('data-lang') === 'en' ? 'en' : 'fr', false);
  if (btnFr) btnFr.addEventListener('click', function () { setLang('fr', true); });
  if (btnEn) btnEn.addEventListener('click', function () { setLang('en', true); });

  /* ---------- Son (activé par défaut ; les navigateurs ne l'autorisent qu'après un premier clic ou une touche) ---------- */
  var ctx = null, soundOn = true, unlocked = false, sndBtn = d.getElementById('snd');
  try { if (localStorage.getItem('jg-sound') === 'off') soundOn = false; } catch (e) {}
  function syncSnd() { if (sndBtn) sndBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); }
  syncSnd();
  function unlock() {
    if (!soundOn || unlocked) return;
    if (audio()) unlocked = true;
    if (unlocked) ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (t) { d.removeEventListener(t, unlock, true); });
  }
  ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (t) { d.addEventListener(t, unlock, true); });
  function audio() {
    if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function violin(freq, at, dur, vol) {
    if (!soundOn || !unlocked) return; var c = audio(); if (!c) return;
    var t = c.currentTime + (at || 0); dur = dur || 1.1; vol = vol || .11;
    var o1 = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(),
        f = c.createBiquadFilter(), g = c.createGain();
    o1.type = 'sawtooth'; o2.type = 'triangle'; o1.frequency.value = freq; o2.frequency.value = freq * 1.004;
    lfo.frequency.value = 5.3; lg.gain.value = freq * .006; lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    f.type = 'lowpass'; f.frequency.value = Math.min(freq * 4.5, 3000); f.Q.value = .5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .14); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(c.destination);
    o1.start(t); o2.start(t); lfo.start(t); o1.stop(t + dur + .05); o2.stop(t + dur + .05); lfo.stop(t + dur + .05);
  }
  function thump() {
    if (!soundOn || !unlocked) return; var c = audio(); if (!c) return; var t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + .16);
    g.gain.setValueAtTime(.32, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .25);
    var len = Math.floor(c.sampleRate * .05), buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var n = c.createBufferSource(), ng = c.createGain(), nf = c.createBiquadFilter();
    nf.type = 'lowpass'; nf.frequency.value = 900; ng.gain.value = .12; n.buffer = buf; n.connect(nf); nf.connect(ng); ng.connect(c.destination); n.start(t);
  }
  /* Bruit de page qu'on tourne : du papier qui frotte (bruit filtré, jamais de fichier audio) */
  function paper(kind) {
    if (!soundOn || !unlocked) return; var c = audio(); if (!c) return; var t = c.currentTime;
    var open = kind === 'open', dur = open ? .62 : .42, len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0), i;
    for (i = 0; i < len; i++) { var x = i / len; ch[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.pow(x, .65)) * (.5 + .5 * Math.random()); }
    var n = c.createBufferSource(), bp = c.createBiquadFilter(), hp = c.createBiquadFilter(), g = c.createGain();
    n.buffer = buf; bp.type = 'bandpass'; bp.Q.value = .8; hp.type = 'highpass'; hp.frequency.value = 650;
    bp.frequency.setValueAtTime(1500, t); bp.frequency.exponentialRampToValueAtTime(5600, t + dur * .85);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(open ? .34 : .26, t + dur * .28); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    n.connect(bp); bp.connect(hp); hp.connect(g); g.connect(c.destination); n.start(t);
    var o = c.createOscillator(), og = c.createGain(), s = t + dur * .72;
    o.type = 'sine'; o.frequency.setValueAtTime(110, s); o.frequency.exponentialRampToValueAtTime(55, s + .1);
    og.gain.setValueAtTime(.0001, s); og.gain.linearRampToValueAtTime(open ? .12 : .08, s + .01); og.gain.exponentialRampToValueAtTime(.0001, s + .14);
    o.connect(og); og.connect(c.destination); o.start(s); o.stop(s + .16);
  }
  if (sndBtn) sndBtn.addEventListener('click', function () {
    soundOn = !soundOn; syncSnd(); try { localStorage.setItem('jg-sound', soundOn ? 'on' : 'off'); } catch (e) {}
    if (soundOn) { if (audio()) unlocked = true; violin(392, 0, .9, .09); violin(587.33, .22, 1.1, .09); }
  });

  /* ---------- Panneaux ---------- */
  var panels = {}, order = [];
  d.querySelectorAll('.panel').forEach(function (p) { panels[p.getAttribute('data-panel')] = p; if (p.getAttribute('data-panel') !== 'essentiel') order.push(p.getAttribute('data-panel')); });
  var anchorMap = { 'cas-sdx': 'sdx', 'cas-location': 'leroy', 'cas-outillage': 'leroy', 'missions': 'leroy', 'projets': 'leroy', 'geo': 'geo', 'jopa': 'jopa', 'oseria': 'oseria', 'international': 'international', 'contenu': 'contenu', 'recommandation': 'reco', 'contact': 'contact', 'accueil': 'essentiel', 'apports': 'essentiel' };
  var current = null, opener = null, scrim = d.querySelector('.scrim');
  var sceneEls = d.querySelectorAll('[data-scene]');
  function setInert(on) { sceneEls.forEach(function (e) { if (on) e.setAttribute('inert', ''); else e.removeAttribute('inert'); }); }

  function show(id, anchor) {
    var p = panels[id]; if (!p) return false;
    if (current && current !== p) hideNow(current);
    if (current === p) { if (anchor) scrollToAnchor(p, anchor); return true; }
    current = p; p.classList.add('show'); void p.offsetWidth; p.classList.add('open');
    root.classList.add('has-panel'); setInert(true); p.scrollTop = 0;
    p.focus({ preventScroll: true });
    if (anchor) setTimeout(function () { scrollToAnchor(p, anchor); }, 60);
    d.dispatchEvent(new CustomEvent('panel', { detail: { id: id, open: true } }));
    return true;
  }
  function scrollToAnchor(p, a) { var t = p.querySelector('#' + a); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function hideNow(p) {
    p.classList.remove('open');
    var done = function () { if (!p.classList.contains('open')) p.classList.remove('show'); };
    if (reduce) done(); else setTimeout(done, 520);
  }
  function hide() {
    if (!current) return; var p = current; current = null; hideNow(p);
    root.classList.remove('has-panel'); setInert(false);
    var back = opener && d.contains(opener) ? opener : null; opener = null;
    if (back) back.focus({ preventScroll: true });
    d.dispatchEvent(new CustomEvent('panel', { detail: { id: p.getAttribute('data-panel'), open: false } }));
  }
  function openPanel(id, anchor, from) {
    if (!panels[id]) return;
    if (!current) opener = from || d.activeElement;
    try { if (!current) history.pushState({ jg: 1 }, '', '#p-' + id); else history.replaceState({ jg: 1 }, '', '#p-' + id); } catch (e) {}
    show(id, anchor);
  }
  function closePanel() {
    if (!current) return;
    if (history.state && history.state.jg) history.back(); else { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} hide(); }
  }
  function fromHash() {
    var m = /^#p-([a-z]+)$/.exec(location.hash);
    if (m && panels[m[1]]) show(m[1]); else hide();
  }
  window.addEventListener('popstate', fromHash);
  function step(dir) {
    if (!current) return; var id = current.getAttribute('data-panel'), i = order.indexOf(id);
    var n = order[(i < 0 ? 0 : i + dir + order.length) % order.length]; openPanel(n);
  }
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current && !d.querySelector('dialog[open]')) { e.preventDefault(); closePanel(); }
  });
  d.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('a,button') : null; if (!t) return;
    if (t.hasAttribute('data-close')) { e.preventDefault(); closePanel(); return; }
    if (t.hasAttribute('data-step')) { e.preventDefault(); step(parseInt(t.getAttribute('data-step'), 10)); return; }
    var o = t.getAttribute('data-open');
    if (o && panels[o]) { e.preventDefault(); openPanel(o, null, t); return; }
    var h = t.tagName === 'A' ? t.getAttribute('href') : null;
    if (h && h.charAt(0) === '#' && h.length > 1) {
      var a = h.slice(1), pid = /^p-/.test(a) ? a.slice(2) : anchorMap[a];
      if (pid && panels[pid]) { e.preventDefault(); openPanel(pid, /^p-/.test(a) ? null : a, t); }
    }
  });
  if (scrim) scrim.addEventListener('click', closePanel);
  if (/^#p-/.test(location.hash)) fromHash();

  /* ---------- Capture Search Console ---------- */
  var lb = d.getElementById('lightbox');
  d.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.shot');
    if (s && lb && lb.showModal) {
      var i = d.getElementById('lb-img'), src = s.querySelector('img');
      i.alt = src ? src.alt : ''; lb.showModal();
    }
    if (e.target.id === 'lb-close' || e.target === lb) lb.close();
  });

  window.JG = { open: openPanel, close: closePanel, note: violin, thump: thump, paper: paper, sound: function () { return soundOn && unlocked; }, reduce: reduce, current: function () { return current ? current.getAttribute('data-panel') : null; } };
})();
