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

/* Homepage advert banner: pause on hover, touch, or press, drag sideways
   while paused, then resume the same loop from the dragged position.
   A small pointer movement is still a click. A sideways drag is not. */
(function () {
  "use strict";
  var reel = document.querySelector(".ad-reel");
  if (!reel) return;
  var track = reel.querySelector(".ad-reel-track");
  if (!track) return;

  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if (reduce && reduce.matches) return;

  var DURATION = 70000;
  var DRAG_PX = 8;
  var MOUSE_DRAG_PX = 24;
  var offset = 0;
  var half = 0;
  var last = 0;
  var paused = false;
  var pointerId = null;
  var pointerType = "";
  var dragging = false;
  var moved = false;
  var startX = 0;
  var startY = 0;
  var lastX = 0;
  var pressLink = null;
  var stopped = false;

  reel.querySelectorAll("a, img").forEach(function (el) { el.setAttribute("draggable", "false"); });

  function wrap(v) {
    if (!half) return 0;
    v %= half;
    if (v < 0) v += half;
    return v;
  }
  function measure() {
    half = track.scrollWidth / 2;
  }
  function readOffset() {
    var tr = window.getComputedStyle(track).transform;
    if (!tr || tr === "none") return 0;
    var m3 = tr.match(/matrix3d\(([^)]+)\)/);
    if (m3) {
      var x3 = parseFloat(m3[1].split(",")[12]);
      return isFinite(x3) ? wrap(-x3) : 0;
    }
    var m = tr.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    var x = parseFloat(m[1].split(",")[4]);
    return isFinite(x) ? wrap(-x) : 0;
  }
  function apply() {
    track.style.transform = "translate3d(" + (-offset) + "px,0,0)";
  }
  function tick(now) {
    if (stopped) return;
    if (!last) last = now;
    var dt = now - last;
    last = now;
    if (!paused && half) {
      offset = wrap(offset + (half / DURATION) * dt);
      apply();
    }
    requestAnimationFrame(tick);
  }
  function hovering() {
    return reel.matches(":hover") || reel.matches(":focus-within");
  }

  measure();
  offset = readOffset();
  track.style.animation = "none";
  apply();
  requestAnimationFrame(tick);

  window.addEventListener("resize", function () {
    measure();
    offset = wrap(offset);
    apply();
  });

  reel.addEventListener("pointerenter", function () { paused = true; });
  reel.addEventListener("pointerleave", function () {
    if (pointerId === null) paused = false;
  });
  reel.addEventListener("focusin", function () { paused = true; });
  reel.addEventListener("focusout", function (e) {
    if (pointerId === null && !reel.contains(e.relatedTarget)) paused = false;
  });

  reel.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    paused = true;
    pointerId = e.pointerId;
    pointerType = e.pointerType || "";
    dragging = false;
    moved = false;
    startX = lastX = e.clientX;
    startY = e.clientY;
    pressLink = e.target && e.target.closest ? e.target.closest("a") : null;
    if (pressLink && !reel.contains(pressLink)) pressLink = null;
    measure();
  });

  reel.addEventListener("pointermove", function (e) {
    if (pointerId !== e.pointerId) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!dragging) {
      var slop = pointerType === "mouse" ? MOUSE_DRAG_PX : DRAG_PX;
      if (Math.abs(dx) < slop || Math.abs(dx) <= Math.abs(dy)) return;
      dragging = true;
      moved = true;
      reel.classList.add("is-dragging");
      try { reel.setPointerCapture(e.pointerId); } catch (err) {}
    }
    var step = e.clientX - lastX;
    lastX = e.clientX;
    offset = wrap(offset - step);
    apply();
  });

  function endPointer(e) {
    if (pointerId !== e.pointerId) return;
    pointerId = null;
    dragging = false;
    reel.classList.remove("is-dragging");
    if (e.pointerType === "touch" || !hovering()) paused = false;
  }
  function releasePress() {
    setTimeout(function () { moved = false; pressLink = null; }, 0);
  }
  reel.addEventListener("pointerup", function (e) {
    endPointer(e);
    releasePress();
  });
  reel.addEventListener("pointercancel", function (e) {
    endPointer(e);
    releasePress();
  });

  reel.addEventListener("click", function (e) {
    if (moved) {
      moved = false;
      pressLink = null;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    var link = pressLink;
    pressLink = null;
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.contains(e.target)) return;
    e.preventDefault();
    window.location.href = link.getAttribute("href");
  }, true);

  reel.addEventListener("dragstart", function (e) { e.preventDefault(); });

  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!reduce.matches) return;
      stopped = true;
      track.style.animation = "";
      track.style.transform = "";
    });
  }
})();
