(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".nav-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

/* Hero background rotation (decorative). First slide is in the HTML and is the LCP image.
   Other slides are built only after window load, one ahead, and each is decoded before it fades in. */
(function () {
  "use strict";
  var root = document.querySelector(".hero-rotator");
  if (!root) return;

  var HOLD = 7000; // ms from one fade start to the next (includes the 2s CSS fade)
  var FADE = 2000; // must match .hero-slide transition
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var conn = navigator.connection || {};
  if ((reduce && reduce.matches) || conn.saveData) return;

  var names = [];
  try { names = JSON.parse(root.getAttribute("data-slides") || "[]"); } catch (e) { names = []; }
  if (!names.length) return;

  var DESK = [800, 1200, 1600, 2560];
  var MOB = [480, 800, 1080];
  function set(n, kind, sizes, ext) {
    return sizes.map(function (w) { return "assets/hero-" + n + "-" + kind + "-" + w + "." + ext + " " + w + "w"; }).join(", ");
  }
  function build(n) {
    var pic = document.createElement("picture");
    pic.className = "hero-slide";
    pic.innerHTML =
      '<source media="(min-width: 45rem)" type="image/webp" srcset="' + set(n, "desktop", DESK, "webp") + '" sizes="100vw">' +
      '<source media="(min-width: 45rem)" type="image/jpeg" srcset="' + set(n, "desktop", DESK, "jpg") + '" sizes="100vw">' +
      '<source type="image/webp" srcset="' + set(n, "mobile", MOB, "webp") + '" sizes="100vw">' +
      '<img src="assets/hero-' + n + '-mobile-800.jpg" srcset="' + set(n, "mobile", MOB, "jpg") + '" sizes="100vw" width="1080" height="1350" alt="" decoding="async">';
    root.appendChild(pic);
    var img = pic.querySelector("img");
    pic._ready = (img.decode ? img.decode() : new Promise(function (r) { img.onload = r; }))
      .then(function () { return true; }, function () { return false; });
    return pic;
  }

  var slides = [root.querySelector(".hero-slide")];
  var current = 0, timer = null, running = false;
  function slideAt(i) {
    if (i === 0) return slides[0];
    if (!slides[i]) slides[i] = build(names[i - 1]);
    return slides[i];
  }
  var total = names.length + 1;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(advance, HOLD);
  }
  function advance() {
    if (!running) return;
    var nextIdx = (current + 1) % total;
    var next = slideAt(nextIdx);
    var ready = next._ready || Promise.resolve(true);
    ready.then(function (ok) {
      if (!running) return;
      if (!ok) { // skip a slide that failed to load
        current = nextIdx; schedule(); return;
      }
      var prev = slides[current];
      next.classList.remove("is-zoom");
      void next.offsetWidth; // restart the zoom animation
      next.classList.add("is-active", "is-zoom");
      prev.classList.remove("is-active");
      setTimeout(function () { if (!prev.classList.contains("is-active")) prev.classList.remove("is-zoom"); }, FADE + 50);
      current = nextIdx;
      slideAt((current + 1) % total); // preload one ahead
      schedule();
    });
  }
  function start() {
    if (running || document.hidden) return;
    running = true;
    root.classList.remove("is-paused");
    schedule();
  }
  function stop() {
    running = false;
    clearTimeout(timer);
    root.classList.add("is-paused");
  }

  function begin() {
    slides[0].classList.add("is-zoom");
    slideAt(1); // preload the second slide right after load
    start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    if (reduce && reduce.addEventListener) {
      reduce.addEventListener("change", function (e) {
        if (!e.matches) return;
        stop();
        slides.forEach(function (s, i) { s.classList.toggle("is-active", i === 0); s.classList.remove("is-zoom"); });
        current = 0;
      });
    }
  }
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
})();
