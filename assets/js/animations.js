/* ==========================================================================
   Heavenly Pampered Suites — Animations
   Vanilla JS: IntersectionObserver reveals, rAF-driven parallax/tilt,
   sticky immersive scroll, magnetic buttons. All gated on
   prefers-reduced-motion and pointer/hover capability.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------------------
     1. Scroll-reveal via IntersectionObserver (staggered entrances)
     ------------------------------------------------------------------ */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var groups = {};
    items.forEach(function (el) {
      var group = el.closest("[data-reveal-group]");
      var key = group ? group.getAttribute("data-reveal-group") : "default-" + Math.random();
      groups[key] = groups[key] || [];
      groups[key].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        el.style.setProperty("--delay", String(i * 90));
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     2. Hero entrance + cinematic depth parallax (scroll + pointer)
     ------------------------------------------------------------------ */
  function initHeroParallax() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    requestAnimationFrame(function () {
      hero.classList.add("is-loaded");
    });

    var media = hero.querySelector(".hero-media img");
    if (!media || reduceMotion) return;

    var ticking = false;
    var pointerX = 0;
    var pointerY = 0;

    function applyTransform() {
      var scrollY = window.scrollY || window.pageYOffset;
      var heroHeight = hero.offsetHeight;
      var progress = Math.min(scrollY / heroHeight, 1);
      var translateY = progress * 90;
      var scale = 1.06 + progress * 0.07;

      var px = canHover ? pointerX * 10 : 0;
      var py = canHover ? pointerY * 10 : 0;

      media.style.transform =
        "translate3d(" + px + "px," + (translateY + py) + "px,0) scale(" + scale + ")";

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(applyTransform);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    if (canHover) {
      hero.addEventListener(
        "mousemove",
        function (e) {
          var rect = hero.getBoundingClientRect();
          pointerX = (e.clientX - rect.left) / rect.width - 0.5;
          pointerY = (e.clientY - rect.top) / rect.height - 0.5;
          onScroll();
        },
        { passive: true }
      );
    }

    applyTransform();
  }

  /* ------------------------------------------------------------------
     3. Sticky immersive section — expand / clip / parallax on scroll
     ------------------------------------------------------------------ */
  function initImmersiveScroll() {
    var section = document.querySelector(".immersive");
    if (!section) return;

    var media = section.querySelector(".immersive-media");
    var img = section.querySelector(".immersive-media img");
    var text = section.querySelector(".immersive-text");

    if (reduceMotion) return;

    var ticking = false;

    function update() {
      var rect = section.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

      var width = 86 + progress * 14;
      var height = 72 + progress * 28;
      var top = 14 - progress * 14;
      var radius = 28 - progress * 28;

      if (media) {
        media.style.width = width + "%";
        media.style.height = height + "%";
        media.style.top = top + "%";
        media.style.borderRadius = radius + "px";
      }

      if (img) {
        var scale = 1.18 - progress * 0.18;
        img.style.transform = "scale(" + scale + ")";
      }

      if (text) {
        var textProgress = Math.min(progress * 1.6, 1);
        text.style.opacity = String(1 - textProgress);
        text.style.transform = "translateY(" + textProgress * -40 + "px)";
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     4. Layered parallax for gallery / professional cards (depth drift)
     ------------------------------------------------------------------ */
  function initLayeredParallax() {
    if (reduceMotion) return;

    var layers = document.querySelectorAll("[data-parallax-speed]");
    if (!layers.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - vh / 2;
        var offset = center * speed * -0.08;
        el.style.transform = "translate3d(0," + offset + "px,0)";
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     5. Cursor-responsive 3D tilt for cards (desktop pointer only)
     ------------------------------------------------------------------ */
  function initCardTilt() {
    if (!canHover || reduceMotion) return;

    var cards = document.querySelectorAll("[data-tilt]");
    cards.forEach(function (card) {
      var bounds;

      function onEnter() {
        bounds = card.getBoundingClientRect();
      }

      function onMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width - 0.5;
        var y = (e.clientY - bounds.top) / bounds.height - 0.5;
        var rotateY = x * 10;
        var rotateX = y * -10;
        card.style.transform =
          "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateZ(0) scale(1.015)";
      }

      function onLeave() {
        card.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1)";
      }

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }

  /* ------------------------------------------------------------------
     6. Magnetic buttons — subtle attraction toward cursor
     ------------------------------------------------------------------ */
  function initMagneticButtons() {
    if (!canHover || reduceMotion) return;

    var buttons = document.querySelectorAll(".magnetic");
    buttons.forEach(function (btn) {
      function onMove(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.22 + "px," + y * 0.32 + "px)";
      }

      function onLeave() {
        btn.style.transform = "translate(0,0)";
      }

      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
    });
  }

  /* ------------------------------------------------------------------
     7. Floating decorative elements — gentle idle drift
     ------------------------------------------------------------------ */
  function initFloatingDecor() {
    if (reduceMotion) return;
    var decor = document.querySelectorAll(".float-decor");
    if (!decor.length) return;

    var start = performance.now();

    function loop(now) {
      var t = (now - start) / 1000;
      decor.forEach(function (el, i) {
        var amp = parseFloat(el.getAttribute("data-amp")) || 10;
        var speed = parseFloat(el.getAttribute("data-speed")) || 1;
        var offset = Math.sin(t * speed + i) * amp;
        el.style.transform = "translate3d(0," + offset + "px,0)";
      });
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initScrollReveal();
    initHeroParallax();
    initImmersiveScroll();
    initLayeredParallax();
    initCardTilt();
    initMagneticButtons();
    initFloatingDecor();
  });
})();
