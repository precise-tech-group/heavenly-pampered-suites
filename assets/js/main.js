/* ==========================================================================
   Heavenly Pampered Suites — Core site behavior
   Navigation, mobile drawer, gallery lightbox, FAQ accordion,
   contact form validation (frontend-only, backend-ready).
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Sticky header background transition
     ------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------
     Mobile navigation drawer
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var drawer = document.querySelector(".mobile-drawer");
    if (!toggle || !drawer) return;

    var focusableSelector = 'a[href], button:not([disabled])';
    var lastFocused = null;

    function openDrawer() {
      lastFocused = document.activeElement;
      drawer.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var firstLink = drawer.querySelector(focusableSelector);
      if (firstLink) firstLink.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key === "Tab") {
        var focusables = Array.prototype.slice.call(drawer.querySelectorAll(focusableSelector));
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    toggle.addEventListener("click", function () {
      var isOpen = drawer.classList.contains("is-open");
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
  }

  /* ------------------------------------------------------------------
     Gallery Lightbox (vanilla JS, keyboard accessible)
     ------------------------------------------------------------------ */
  function initLightbox() {
    var triggers = document.querySelectorAll("[data-lightbox-src]");
    var lightbox = document.querySelector(".lightbox");
    if (!triggers.length || !lightbox) return;

    var img = lightbox.querySelector(".lightbox-figure img");
    var caption = lightbox.querySelector(".lightbox-caption");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");

    var items = Array.prototype.map.call(triggers, function (el) {
      return {
        src: el.getAttribute("data-lightbox-src"),
        alt: el.getAttribute("data-lightbox-alt") || "",
        caption: el.getAttribute("data-lightbox-caption") || ""
      };
    });

    var currentIndex = 0;
    var lastFocused = null;

    function render() {
      var item = items[currentIndex];
      img.src = item.src;
      img.alt = item.alt;
      caption.textContent = item.caption;
    }

    function open(index) {
      currentIndex = index;
      lastFocused = document.activeElement;
      render();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }

    function show(delta) {
      currentIndex = (currentIndex + delta + items.length) % items.length;
      render();
    }

    function onKeydown(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () {
        open(index);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(index);
        }
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () {
      show(-1);
    });
    nextBtn.addEventListener("click", function () {
      show(1);
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
  }

  /* ------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------ */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var question = item.querySelector(".faq-question");
      question.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        items.forEach(function (other) {
          other.setAttribute("data-open", "false");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });
        item.setAttribute("data-open", isOpen ? "false" : "true");
        question.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  /* ------------------------------------------------------------------
     Contact form validation (frontend only — no backend connected)
     Structured so a backend/form provider (e.g. Formspree, Netlify
     Forms, a custom API endpoint) can be wired in at submitForm().
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById("inquiry-form");
    if (!form) return;

    var status = form.querySelector(".form-status");

    var validators = {
      name: function (v) {
        return v.trim().length >= 2 ? "" : "Please enter your full name.";
      },
      email: function (v) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(v.trim()) ? "" : "Please enter a valid email address.";
      },
      phone: function (v) {
        var digits = v.replace(/\D/g, "");
        return digits.length >= 7 ? "" : "Please enter a valid phone number.";
      },
      profession: function (v) {
        return v ? "" : "Please select your profession.";
      },
      message: function (v) {
        return v.trim().length >= 10 ? "" : "Please share a few details (10+ characters).";
      }
    };

    function setFieldError(field, message) {
      var group = field.closest(".form-group");
      if (!group) return;
      var errorEl = group.querySelector(".field-error");
      if (message) {
        group.classList.add("has-error");
        if (errorEl) errorEl.textContent = message;
        field.setAttribute("aria-invalid", "true");
      } else {
        group.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
        field.removeAttribute("aria-invalid");
      }
    }

    function validateField(field) {
      var validator = validators[field.name];
      if (!validator) return true;
      var message = validator(field.value);
      setFieldError(field, message);
      return !message;
    }

    Object.keys(validators).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.closest(".form-group").classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    function showStatus(type, message) {
      status.textContent = message;
      status.className = "form-status is-visible " + type;
    }

    /**
     * Placeholder submission handler. This site has no backend or form
     * service configured. Replace this function's body with a fetch()
     * call to a form endpoint (Formspree, Netlify Forms, a custom API,
     * etc.) once one is available — the validated field values are
     * already collected in `data` below.
     */
    function submitForm(data) {
      return Promise.reject(
        new Error(
          "No form backend is connected yet. Please call or email Heavenly Pampered Suites directly."
        )
      );
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fields = Object.keys(validators).map(function (name) {
        return form.elements[name];
      });
      var allValid = fields.reduce(function (valid, field) {
        return validateField(field) && valid;
      }, true);

      if (!allValid) {
        showStatus("error", "Please correct the highlighted fields and try again.");
        var firstInvalid = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        profession: form.elements.profession.value,
        message: form.elements.message.value.trim()
      };

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      submitForm(data)
        .then(function () {
          showStatus("success", "Thank you — your inquiry has been sent.");
          form.reset();
        })
        .catch(function () {
          showStatus(
            "error",
            "This form isn't connected to a messaging service yet. Please reach out directly at " +
              "727-633-1490 or aishapendleton98@gmail.com — your details are ready to send as soon as it is."
          );
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ------------------------------------------------------------------
     Smooth in-page anchor offset for sticky header
     ------------------------------------------------------------------ */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerH = document.querySelector(".site-header").offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initMobileNav();
    initLightbox();
    initFaq();
    initContactForm();
    initAnchorLinks();
  });
})();
