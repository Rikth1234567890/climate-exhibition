/**
 * main.js
 * ─────────────────────────────────────────────────────────────────
 * Navigation, progress tracking, and interactivity.
 *
 * Phase 2 responsibilities:
 *  1. Track the active slide with IntersectionObserver (+ scroll fallback).
 *  2. Update the slide counter ("3 / 11") in real time.
 *  3. Keep one nav menu link marked aria-current="true".
 *  4. Build and update the vertical progress-dot sidebar.
 *  5. Wire Prev / Next buttons (bottom control bar).
 *  6. Keyboard navigation:
 *       ArrowDown, PageDown, Space  → next slide
 *       ArrowUp,   PageUp           → previous slide
 *       Home                        → first slide
 *       End                         → last slide
 *  7. Mobile hamburger toggle for the section menu.
 *  8. Entrance animations via data-anim attributes.
 *
 * Constraints:
 *  - Zero external dependencies — works from file:// with no server.
 *  - Never blocks normal browser scrolling.
 *  - Ignores keyboard shortcuts when focus is in an input / textarea /
 *    select / contenteditable element.
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

/* ================================================================
   HELPERS
   ================================================================ */

/** querySelector shorthand */
function qs(selector, root) {
  return (root || document).querySelector(selector);
}

/** querySelectorAll → Array shorthand */
function qsa(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

/**
 * Returns true when the keyboard event originates from an element
 * where the user is actively typing, so we do not steal their keys.
 * @param {KeyboardEvent} e
 * @returns {boolean}
 */
function isTypingContext(e) {
  var el = document.activeElement;
  if (!el) return false;
  var tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  // contenteditable="true" or contenteditable="" (empty string = true)
  var ce = el.getAttribute("contenteditable");
  return ce === "true" || ce === "";
}


/* ================================================================
   SLIDE REGISTRY
   ================================================================ */

var slides      = qsa(".slide");        // NodeList → Array
var SLIDE_COUNT = slides.length;        // 11

/**
 * Zero-based index of the slide that is currently the most visible.
 * Updated by both the IntersectionObserver and the scroll fallback.
 * All navigation reads from this variable before moving.
 */
var currentIndex = 0;

/**
 * Set to true after the first setActiveSlide() call completes.
 * Prevents the no-op guard from skipping the startup initialisation.
 */
var initialised = false;


/* ================================================================
   SCROLL TO SLIDE
   Uses scrollTop on the document root so it cooperates with the
   CSS scroll-snap declared on <html>. scrollIntoView() can fight
   with mandatory snap, causing the browser to snap back.
   ================================================================ */

/**
 * Smoothly scroll the page to bring slide[index] into view.
 * @param {number} index — zero-based
 */
function scrollToSlide(index) {
  if (index < 0 || index >= SLIDE_COUNT) return;

  var target = slides[index];
  if (!target) return;

  // offsetTop of the slide relative to the document, minus the
  // fixed top bar height so the slide title isn't hidden behind it.
  var topbarHeight = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--topbar-height")
  ) || 56; // px fallback if CSS variable is unavailable

  // Convert rem to px if the value came back with "rem" units.
  // getComputedStyle resolves CSS variables to their computed value,
  // which for --topbar-height is "3.5rem". We need px.
  var rawVal = getComputedStyle(document.documentElement)
    .getPropertyValue("--topbar-height").trim();

  if (rawVal.endsWith("rem")) {
    topbarHeight = parseFloat(rawVal) *
      parseFloat(getComputedStyle(document.documentElement).fontSize);
  } else if (rawVal.endsWith("px")) {
    topbarHeight = parseFloat(rawVal);
  } else {
    topbarHeight = 56; // safe default
  }

  var targetTop = target.getBoundingClientRect().top +
                  window.pageYOffset -
                  topbarHeight;

  window.scrollTo({ top: targetTop, behavior: "smooth" });
}

/** Go to previous slide (clamps at 0). */
function prevSlide() {
  scrollToSlide(Math.max(currentIndex - 1, 0));
}

/** Go to next slide (clamps at last slide). */
function nextSlide() {
  scrollToSlide(Math.min(currentIndex + 1, SLIDE_COUNT - 1));
}


/* ================================================================
   ACTIVE SLIDE TRACKING — shared update function
   Called by both the IntersectionObserver and the scroll fallback.
   ================================================================ */

/**
 * Central "this slide is now active" handler.
 * Updates: index variable, counter, nav links, dots, page title.
 * @param {number} index
 */
function setActiveSlide(index) {
  if (index === currentIndex && initialised) return; // no-op if unchanged after first run
  currentIndex = index;

  var slide = slides[index];
  if (!slide) return;

  updateCounter(index);
  updateMenuLinks(slide.id);
  updateProgressDots(index);
  updatePrevNextButtons(index);

  // Readable page title for browser history / accessibility
  var label = slide.getAttribute("aria-label");
  if (label) {
    document.title = label + " \u2014 Earth\u2019s Climate";
  }

  initialised = true;
}


/* ================================================================
   SLIDE COUNTER  ("3 / 11")
   ================================================================ */

var slideCounterEl      = qs(".slide-counter");        // topbar live region
var controlsCounterEl  = qs(".slide-controls__counter"); // bottom bar display

/**
 * @param {number} index — zero-based
 */
function updateCounter(index) {
  var current = index + 1;
  var text    = current + " / " + SLIDE_COUNT;
  var ariaLbl = "Slide " + current + " of " + SLIDE_COUNT;

  if (slideCounterEl) {
    slideCounterEl.textContent = text;
    slideCounterEl.setAttribute("aria-label", ariaLbl);
  }

  // Mirror into the bottom bar counter (purely visual, not a live region)
  if (controlsCounterEl) {
    controlsCounterEl.textContent = text;
  }
}


/* ================================================================
   SECTION MENU ACTIVE STATE
   ================================================================ */

var menuLinks = qsa(".section-menu__link");

/**
 * @param {string} slideId — the id attribute of the active slide
 */
function updateMenuLinks(slideId) {
  menuLinks.forEach(function(link) {
    var isCurrent = link.getAttribute("href") === ("#" + slideId);
    link.setAttribute("aria-current", isCurrent ? "true" : "false");
  });
}


/* ================================================================
   PROGRESS DOTS  (right-edge vertical column)
   ================================================================ */

/**
 * Build one <li><button> per slide and append to .progress-nav.
 * Called once at startup.
 */
function buildProgressNav() {
  var nav = qs(".progress-nav");
  if (!nav) return;

  slides.forEach(function(slide, i) {
    var li    = document.createElement("li");
    var dot   = document.createElement("button");
    var label = slide.getAttribute("aria-label") || ("Slide " + (i + 1));

    dot.className = "progress-nav__dot";
    dot.setAttribute("type", "button");
    dot.setAttribute("aria-label", "Go to: " + label);
    dot.setAttribute("title", label);
    dot.setAttribute("aria-current", i === 0 ? "true" : "false");
    dot.dataset.index = i;

    dot.addEventListener("click", function() {
      scrollToSlide(i);
    });

    li.appendChild(dot);
    nav.appendChild(li);
  });
}

/**
 * @param {number} index — zero-based
 */
function updateProgressDots(index) {
  var dots = qsa(".progress-nav__dot");
  dots.forEach(function(dot, i) {
    dot.setAttribute("aria-current", i === index ? "true" : "false");
  });
}


/* ================================================================
   PREV / NEXT BUTTONS
   ================================================================ */

/**
 * Update the disabled state and accessible labels of Prev / Next.
 * @param {number} index — zero-based
 */
function updatePrevNextButtons(index) {
  var prevBtn = qs(".nav-prev");
  var nextBtn = qs(".nav-next");

  if (prevBtn) {
    prevBtn.disabled = index === 0;
    prevBtn.setAttribute(
      "aria-label",
      index === 0
        ? "Previous slide (you are on the first slide)"
        : "Previous slide: " + slides[index - 1].getAttribute("aria-label")
    );
  }

  if (nextBtn) {
    nextBtn.disabled = index === SLIDE_COUNT - 1;
    nextBtn.setAttribute(
      "aria-label",
      index === SLIDE_COUNT - 1
        ? "Next slide (you are on the last slide)"
        : "Next slide: " + slides[index + 1].getAttribute("aria-label")
    );
  }
}

/**
 * Wire click handlers on the Prev and Next buttons.
 */
function initPrevNextButtons() {
  var prevBtn = qs(".nav-prev");
  var nextBtn = qs(".nav-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function() { prevSlide(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function() { nextSlide(); });
  }
}


/* ================================================================
   INTERSECTION OBSERVER
   Most reliable way to know which slide is visible.
   Threshold 0.5 → slide must cover ≥ 50 % of the viewport.
   ================================================================ */

function initIntersectionObserver() {
  // Safety check — IntersectionObserver is supported in all modern
  // browsers but we guard anyway; the scroll fallback covers the gap.
  if (typeof IntersectionObserver === "undefined") return false;

  var options = {
    root: null,
    rootMargin: "0px",
    /*
     * Threshold [0, 0.1] fires both on entry and when 10% is visible.
     * We use the scroll-based findActiveSlideByScroll() to pick the
     * most-visible slide accurately; IO just triggers that check.
     * This correctly handles slides taller than the viewport.
     */
    threshold: [0, 0.1]
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;

      var slide = entry.target;
      var index = slides.indexOf(slide);
      if (index === -1) return;

      /*
       * For slides taller than the viewport, we cannot rely on the
       * intersection ratio to pick the "active" slide — instead we
       * ask findActiveSlideByScroll to compare all slide midpoints.
       * For short slides (ratio ≥ 0.5) the entry itself is used.
       */
      if (entry.intersectionRatio >= 0.5) {
        setActiveSlide(index);
      } else {
        findActiveSlideByScroll();
      }

      // Trigger entrance animation once per slide
      if (!slide.dataset.animated) {
        slide.dataset.animated = "true";
        qsa("[data-anim]", slide).forEach(function(el) {
          el.classList.add("anim-enter");
        });
      }
    });
  }, options);

  slides.forEach(function(slide) { observer.observe(slide); });
  return true; // signal that IO is running
}


/* ================================================================
   SCROLL FALLBACK
   Used when IntersectionObserver is unavailable.
   Finds the slide whose top edge is closest to the top of the
   viewport (after accounting for the top bar) and marks it active.
   Throttled to run at most once per animation frame.
   ================================================================ */

function initScrollFallback() {
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      ticking = false;
      findActiveSlideByScroll();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}

function findActiveSlideByScroll() {
  var midViewport = window.pageYOffset + window.innerHeight / 2;
  var best = 0;
  var bestDist = Infinity;

  slides.forEach(function(slide, i) {
    var rect = slide.getBoundingClientRect();
    var slideTop = rect.top + window.pageYOffset;
    var slideMid = slideTop + rect.height / 2;
    var dist = Math.abs(slideMid - midViewport);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });

  setActiveSlide(best);
}


/* ================================================================
   KEYBOARD NAVIGATION
   ================================================================ */

function initKeyboardNav() {
  document.addEventListener("keydown", function(e) {
    // Never steal keys from text inputs or contenteditable elements
    if (isTypingContext(e)) return;

    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
        e.preventDefault();
        nextSlide();
        break;

      case " ": // Space
        // Space normally scrolls the page; we redirect it to next slide.
        // Only do this when no interactive element (button, link) has focus,
        // so the user can still activate buttons with Space.
        if (document.activeElement === document.body ||
            document.activeElement === null) {
          e.preventDefault();
          nextSlide();
        }
        break;

      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        prevSlide();
        break;

      case "Home":
        e.preventDefault();
        scrollToSlide(0);
        break;

      case "End":
        e.preventDefault();
        scrollToSlide(SLIDE_COUNT - 1);
        break;

      default:
        break;
    }
  });
}


/* ================================================================
   MOBILE NAV TOGGLE  (hamburger ☰)
   ================================================================ */

function initNavToggle() {
  var toggle = qs(".nav-toggle");
  var menu   = qs(".section-menu");
  if (!toggle || !menu) return;

  // Give the menu an id so the toggle's aria-controls points to it
  if (!menu.id) menu.id = "section-menu";

  toggle.addEventListener("click", function() {
    var isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label",
      isOpen ? "Close section menu" : "Open section menu");
    toggle.textContent = isOpen ? "\u2715" : "\u2630"; // ✕ : ☰
  });

  // Close menu when any link is clicked
  menuLinks.forEach(function(link) {
    link.addEventListener("click", function() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open section menu");
      toggle.textContent = "\u2630";
    });
  });

  // Close menu on Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open section menu");
      toggle.textContent = "\u2630";
      toggle.focus();
    }
  });
}


/* ================================================================
   SECTION MENU LINK CLICK → SMOOTH SCROLL
   The href="#slide-…" links work via the browser's native anchor
   navigation. We intercept them only to call our smooth scroller,
   so the page title and nav state update immediately.
   ================================================================ */

function initMenuLinkClicks() {
  menuLinks.forEach(function(link) {
    link.addEventListener("click", function(e) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;

      var targetId = href.slice(1);
      var targetIdx = slides.findIndex(function(s) {
        return s.id === targetId;
      });

      if (targetIdx === -1) return; // let browser handle unknown anchors

      e.preventDefault(); // stop browser's native jump
      scrollToSlide(targetIdx);
    });
  });
}


/* ================================================================
   INIT
   ================================================================ */

document.addEventListener("DOMContentLoaded", function() {

  if (SLIDE_COUNT === 0) {
    console.warn("main.js: no .slide elements found.");
    return;
  }

  // 1. Build sidebar progress dots
  buildProgressNav();

  // 2. Start IntersectionObserver; fall back to scroll listener
  var ioRunning = initIntersectionObserver();
  if (!ioRunning) {
    console.info("main.js: IntersectionObserver not available, using scroll fallback.");
    initScrollFallback();
    // Run once immediately so the initial state is correct
    findActiveSlideByScroll();
  } else {
    // Always also run the scroll fallback alongside IO so that
    // content slides taller than the viewport track correctly.
    initScrollFallback();
  }

  // 3. Mobile hamburger
  initNavToggle();

  // 4. Keyboard shortcuts
  initKeyboardNav();

  // 5. Prev / Next button wiring
  initPrevNextButtons();

  // 6. Section menu smooth scroll
  initMenuLinkClicks();

  // 7. Set initial counter and nav state
  setActiveSlide(0);

  // ── SLIDE 3: Climate System component selector ──────────────────
  initClimateSystem();

  // ── SLIDE 4: Greenhouse-effect toggle ──────────────────────────
  initGreenhouseToggle();

  // ── SLIDE 5: Causes comparison button ──────────────────────────
  initCausesComparison();

  // ── SLIDE 6: Evidence explorer tabs ────────────────────────────
  initEvidenceTabs();

  // ── SLIDE 6: Anomaly explainer button ──────────────────────────
  initAnomalyExplainer();

  // ── SLIDE 1: Title star-field and sparkles ──────────────────────
  initTitleSlide();

  // ── MEDIA REVIEW PANEL: show/hide logic ────────────────────────
  initMediaReviewPanel();

  // ── STARTUP: duplicate src check ──────────────────────────────
  checkDuplicateMediaSources();

  // ── SLIDE 7: Climate model pipeline ────────────────────────────
  initModelPipeline();

  // ── SLIDE 8: Manabe sequence ────────────────────────────────────
  initManabeSequence();

  // ── SLIDE 9: Hasselmann signal/noise ───────────────────────────
  initHasselmannSlide();

  // ── SLIDE 10: Feedbacks and scenarios ──────────────────────────
  initFeedbackExplorer();
  initScenarioExplorer();

  // ── SLIDE 11: Conclusion navigation buttons ─────────────────────
  initConclusionNav();

  // ── SLIDE 6: Temperature graph (loads local CSV) ────────────────
  initTemperatureGraph();

  console.log(
    "%c\uD83C\uDF0D Earth\u2019s Climate Exhibition \u2014 " +
    SLIDE_COUNT + " slides loaded",
    "color:#38bdf8;font-weight:bold;font-size:14px;"
  );
});


/* ================================================================
   SLIDE 3 — CLIMATE SYSTEM COMPONENT SELECTOR
   Highlights an SVG node and updates the info panel when the user
   clicks or keyboards a component button.
   ================================================================ */

/**
 * Content for each climate system component.
 * Key matches the data-system attribute on the buttons.
 */
var CLIMATE_SYSTEM_INFO = {
  atmosphere: {
    label: "Atmosphere",
    text: "The atmosphere contains gases that move heat and moisture around " +
          "the planet and interact with incoming sunlight and outgoing " +
          "infrared radiation."
  },
  ocean: {
    label: "Ocean",
    text: "The ocean stores and transports large amounts of heat and exchanges " +
          "water and gases with the atmosphere."
  },
  land: {
    label: "Land",
    text: "Land surfaces absorb and reflect sunlight, store carbon, and " +
          "influence the movement of heat and water."
  },
  ice: {
    label: "Ice",
    text: "Ice and snow reflect much of the sunlight that reaches them. " +
          "Changes in ice can therefore affect the energy absorbed by Earth."
  },
  biosphere: {
    label: "Biosphere",
    text: "Plants, animals, and microorganisms exchange carbon and water with " +
          "the atmosphere, ocean, and land."
  }
};

/** All known component names (must match data-system values and SVG IDs). */
var CS_COMPONENTS = ["atmosphere", "ocean", "land", "ice", "biosphere"];

/** Currently selected component, or null for default state. */
var csSelected = null;

function initClimateSystem() {
  var buttons   = qsa(".cs-btn");
  var panelLabel = qs("#cs-panel-label");
  var panelText  = qs("#cs-panel-text");

  // Guard: bail if any required element is absent
  if (!buttons.length || !panelLabel || !panelText) return;

  buttons.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var system = btn.getAttribute("data-system");
      if (!system) return;

      // If already selected, deselect (toggle off)
      if (csSelected === system) {
        csSelected = null;
        resetClimateSystemState(buttons, panelLabel, panelText);
        return;
      }

      csSelected = system;
      selectClimateComponent(system, buttons, panelLabel, panelText);
    });
  });
}

/**
 * Activate a component: update buttons, SVG nodes, and info panel.
 * @param {string} system
 * @param {Element[]} buttons
 * @param {Element} panelLabel
 * @param {Element} panelText
 */
function selectClimateComponent(system, buttons, panelLabel, panelText) {
  var info = CLIMATE_SYSTEM_INFO[system];
  if (!info) return;

  // Update all buttons
  buttons.forEach(function(btn) {
    var isThis = btn.getAttribute("data-system") === system;
    btn.setAttribute("aria-pressed", isThis ? "true" : "false");
  });

  // Update SVG nodes — dim all, then highlight selected
  CS_COMPONENTS.forEach(function(name) {
    var node = qs("#cs-node-" + name);
    var line = qs("#cs-line-" + name);
    if (node) {
      node.style.opacity = name === system ? "1" : "0.2";
    }
    if (line) {
      line.style.opacity = name === system ? "0.9" : "0.15";
    }
  });

  // Update info panel (aria-live region picks this up automatically)
  panelLabel.textContent = info.label;
  panelLabel.className = "cs-info-panel__label is-active";
  panelText.textContent  = info.text;
}

/**
 * Reset to default state: no component selected.
 * @param {Element[]} buttons
 * @param {Element} panelLabel
 * @param {Element} panelText
 */
function resetClimateSystemState(buttons, panelLabel, panelText) {
  buttons.forEach(function(btn) {
    btn.setAttribute("aria-pressed", "false");
  });

  CS_COMPONENTS.forEach(function(name) {
    var node = qs("#cs-node-" + name);
    var line = qs("#cs-line-" + name);
    if (node) node.style.opacity = "";
    if (line) line.style.opacity = "";
  });

  panelLabel.textContent = "Select a component to explore.";
  panelLabel.className   = "cs-info-panel__label";
  panelText.textContent  =
    "Click one of the five buttons to learn about that part of " +
    "Earth\u2019s climate system.";
}


/* ================================================================
   SLIDE 4 — GREENHOUSE EFFECT TOGGLE
   Shows / hides enhanced-absorption arrows in the SVG and updates
   the status text when the toggle button is pressed.
   ================================================================ */

/**
 * Text shown below the toggle button in each state.
 */
var GH_STATUS_DEFAULT  = "Currently showing: natural greenhouse effect";
var GH_STATUS_ENHANCED = "Currently showing: increased greenhouse-gas absorption";

function initGreenhouseToggle() {
  var btn        = qs("#gh-toggle-btn");
  var statusEl   = qs("#gh-toggle-desc");
  var diagramWrap = qs("#gh-diagram-wrap");

  // Guard: bail if elements are missing
  if (!btn || !statusEl || !diagramWrap) return;

  // Check user's motion preference once
  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  btn.addEventListener("click", function() {
    var isEnhanced = btn.getAttribute("aria-pressed") === "true";

    // Toggle the pressed state
    isEnhanced = !isEnhanced;
    btn.setAttribute("aria-pressed", isEnhanced ? "true" : "false");

    // Add / remove class on the diagram wrapper.
    // CSS uses .is-enhanced on the wrapper to show/hide .gh-arrow-enhanced
    // elements via their opacity transition.
    if (isEnhanced) {
      diagramWrap.classList.add("is-enhanced");

      // If reduced motion, skip CSS transition by temporarily removing it
      if (reducedMotion) {
        qsa(".gh-arrow-enhanced", diagramWrap).forEach(function(el) {
          el.style.transition = "none";
        });
      }

      statusEl.textContent = GH_STATUS_ENHANCED;
      statusEl.className   = "gh-toggle-status is-enhanced";
    } else {
      diagramWrap.classList.remove("is-enhanced");
      statusEl.textContent = GH_STATUS_DEFAULT;
      statusEl.className   = "gh-toggle-status";
    }
  });
}


/* ================================================================
   SLIDE 5 — CAUSES COMPARISON BUTTON
   Toggles between two attribution-science explanations in an
   aria-live panel. Each click advances to the next message;
   clicking again cycles back.
   ================================================================ */

var CAUSES_MESSAGES = [
  "Scientists ask whether the observed pattern, timing, and magnitude of " +
  "warming are consistent with natural influences alone or require human influences.",

  "Attribution studies combine observations, physical understanding, and model " +
  "experiments to evaluate the causes of detected climate changes."
];

function initCausesComparison() {
  var btn      = qs("#causes-compare-btn");
  var textEl   = qs("#causes-compare-text");

  // Guard: bail safely if elements are absent
  if (!btn || !textEl) return;

  var step = 0; // 0 = default state, 1 = first message, 2 = second message

  btn.addEventListener("click", function() {
    step = (step % CAUSES_MESSAGES.length) + 1;
    if (step > CAUSES_MESSAGES.length) step = 1;

    var msgIndex = step - 1;
    textEl.textContent = CAUSES_MESSAGES[msgIndex];

    // aria-expanded: true while any message is shown
    btn.setAttribute("aria-expanded", "true");

    // After showing both messages, next click resets
    if (step === CAUSES_MESSAGES.length) {
      // User can click once more to cycle back; we keep expanded=true
      // and the next click will roll over via the modulo above
    }
  });
}


/* ================================================================
   SLIDE 6 — EVIDENCE EXPLORER TABS
   Full ARIA tab-panel pattern with keyboard navigation.

   Keyboard spec:
     ArrowRight / ArrowDown  → next tab
     ArrowLeft  / ArrowUp    → previous tab
     Home                    → first tab
     End                     → last tab
     Enter / Space           → activate focused tab

   These keys are consumed only when focus is INSIDE the tablist,
   so they do not interfere with the global slide keyboard shortcuts.
   ================================================================ */

function initEvidenceTabs() {
  var tablist  = qs("#evidence-tablist");
  var statusEl = qs("#evidence-tab-status");

  // Guard: bail if the tablist doesn't exist on the page
  if (!tablist) return;

  var tabs = qsa('[role="tab"]', tablist);
  if (!tabs.length) return;

  /* ── Activate a tab by index ───────────────────────────────── */
  function activateTab(index) {
    tabs.forEach(function(tab, i) {
      var panel = qs("#" + tab.getAttribute("aria-controls"));
      var isActive = i === index;

      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      // Roving tabindex: only the active tab is in the tab sequence
      tab.setAttribute("tabindex", isActive ? "0" : "-1");

      if (panel) {
        if (isActive) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      }
    });

    // Announce to screen readers via aria-live region
    var label = tabs[index].textContent.trim();
    if (statusEl) {
      statusEl.textContent = "Showing evidence for " + label + ".";
    }
  }

  /* ── Wire click on each tab ─────────────────────────────────── */
  tabs.forEach(function(tab, i) {
    tab.addEventListener("click", function() {
      activateTab(i);
      tab.focus();
    });
  });

  /* ── Keyboard navigation inside the tablist ─────────────────── */
  tablist.addEventListener("keydown", function(e) {
    var currentIdx = tabs.findIndex(function(t) {
      return t === document.activeElement;
    });
    if (currentIdx === -1) return;  // focus is not on a tab; ignore

    var newIdx = currentIdx;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();   // prevent global slide nav from firing
        newIdx = (currentIdx + 1) % tabs.length;
        break;

      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        newIdx = (currentIdx - 1 + tabs.length) % tabs.length;
        break;

      case "Home":
        e.preventDefault();
        e.stopPropagation();
        newIdx = 0;
        break;

      case "End":
        e.preventDefault();
        e.stopPropagation();
        newIdx = tabs.length - 1;
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        // Activate the currently focused tab (may already be active)
        activateTab(currentIdx);
        return;

      default:
        return;
    }

    // Move focus then activate
    tabs[newIdx].focus();
    activateTab(newIdx);
  });

  // Ensure initial state is consistent with HTML (first tab active)
  activateTab(0);
}


/* ================================================================
   SLIDE 6 — ANOMALY EXPLAINER BUTTON
   Simple show/hide toggle for the temperature-anomaly explanation.
   ================================================================ */

function initAnomalyExplainer() {
  var btn   = qs("#anomaly-explain-btn");
  var panel = qs("#anomaly-explain-panel");

  if (!btn || !panel) return;

  btn.addEventListener("click", function() {
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen = !isOpen;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  });
}


/* ================================================================
   SLIDE 1 — TITLE SLIDE ANIMATIONS
   Creates a star-field background and sparkle overlay.
   All effects are skipped when prefers-reduced-motion is set.
   ================================================================ */

function initTitleSlide() {
  var titleSlide  = qs("#slide-title");
  var starsWrap   = qs(".title-stars");

  if (!titleSlide || !starsWrap) return;

  // Respect user's motion preference
  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Build star-field ───────────────────────────────────────── */
  var STAR_COUNT = reducedMotion ? 30 : 110;

  for (var s = 0; s < STAR_COUNT; s++) {
    var star = document.createElement("span");
    star.className = "title-star";

    var size     = Math.random() * 2.5 + 0.5;   // 0.5 – 3 px
    var opacity  = Math.random() * 0.6 + 0.2;   // 0.2 – 0.8
    var dur      = (Math.random() * 4 + 2).toFixed(1) + "s"; // 2 – 6 s
    var delay    = (Math.random() * 6).toFixed(1) + "s";     // 0 – 6 s

    star.style.cssText = [
      "width:"   + size + "px",
      "height:"  + size + "px",
      "left:"    + (Math.random() * 100) + "%",
      "top:"     + (Math.random() * 100) + "%",
      "--star-dur:"     + dur,
      "--star-delay:"   + delay,
      "--star-opacity:" + opacity.toFixed(2)
    ].join(";");

    starsWrap.appendChild(star);
  }

  /* ── Sparkle bursts around the title heading ────────────────── */
  if (reducedMotion) return;  // no sparkles for reduced-motion users

  var titleBlock = qs(".title-block", titleSlide);
  if (!titleBlock) return;

  var SPARKLE_COUNT = 18;
  var SPARKLE_COLORS = [
    "#38bdf8", "#7dd3fc", "#f5a623", "#ffc85a",
    "#e8edf5", "#fdba74", "#93c5fd"
  ];

  for (var k = 0; k < SPARKLE_COUNT; k++) {
    var sp = document.createElement("span");
    sp.className = "title-sparkle";

    var spSize  = Math.random() * 5 + 3;    // 3 – 8 px
    var spColor = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    var spDur   = (Math.random() * 1.5 + 1).toFixed(1) + "s"; // 1 – 2.5 s
    var spDelay = (Math.random() * 4 + 0.6).toFixed(1) + "s"; // 0.6 – 4.6 s

    // Position around the title block area
    sp.style.cssText = [
      "width:"           + spSize + "px",
      "height:"          + spSize + "px",
      "left:"            + (Math.random() * 90 + 5) + "%",
      "top:"             + (Math.random() * 60 + 10) + "%",
      "background:"      + spColor,
      "box-shadow:0 0 "  + (spSize * 2) + "px " + spColor,
      "--sp-dur:"        + spDur,
      "--sp-delay:"      + spDelay
    ].join(";");

    titleBlock.appendChild(sp);
  }
}


/* ================================================================
   SLIDE 7 — CLIMATE MODEL PIPELINE TABS
   Same roving-tabindex ARIA pattern as the evidence explorer.
   ArrowLeft/Right navigate; Enter/Space activate.
   stopPropagation prevents firing the global slide keyboard nav.
   ================================================================ */

function initModelPipeline() {
  var tablist  = qs("#pipeline-tablist");
  var statusEl = qs("#pipeline-status");
  if (!tablist) return;

  var tabs = qsa('[role="tab"]', tablist);
  if (!tabs.length) return;

  function activatePipelineTab(index) {
    tabs.forEach(function(tab, i) {
      var panel = qs("#" + tab.getAttribute("aria-controls"));
      var active = i === index;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
      if (panel) {
        if (active) { panel.removeAttribute("hidden"); }
        else        { panel.setAttribute("hidden", ""); }
      }
    });
    var label = tabs[index].querySelector(".pipeline-tab__label");
    if (statusEl && label) {
      statusEl.textContent = "Showing: " + label.textContent.trim() + ".";
    }
  }

  tabs.forEach(function(tab, i) {
    tab.addEventListener("click", function() {
      activatePipelineTab(i);
      tab.focus();
    });
  });

  tablist.addEventListener("keydown", function(e) {
    var cur = tabs.findIndex(function(t) { return t === document.activeElement; });
    if (cur === -1) return;
    var next = cur;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown":
        e.preventDefault(); e.stopPropagation();
        next = (cur + 1) % tabs.length; break;
      case "ArrowLeft": case "ArrowUp":
        e.preventDefault(); e.stopPropagation();
        next = (cur - 1 + tabs.length) % tabs.length; break;
      case "Home":
        e.preventDefault(); e.stopPropagation(); next = 0; break;
      case "End":
        e.preventDefault(); e.stopPropagation(); next = tabs.length - 1; break;
      case "Enter": case " ":
        e.preventDefault(); activatePipelineTab(cur); return;
      default: return;
    }
    tabs[next].focus();
    activatePipelineTab(next);
  });

  activatePipelineTab(0);
}


/* ================================================================
   SLIDE 8 — MANABE PROCESS SEQUENCE
   Simple press-button pattern. Each button updates a text panel.
   ================================================================ */

var MANABE_STEPS = [
  "The climate system receives energy from the Sun and emits infrared radiation.",
  "Greenhouse gases interact with outgoing infrared radiation.",
  "Convection and air movement transport heat through the atmosphere.",
  "The surface temperature responds to the combined energy balance.",
  "Changing a model input allows scientists to examine a physical response."
];

function initManabeSequence() {
  var stepsWrap = qs("#manabe-steps");
  var panelText = qs("#manabe-panel-text");
  var statusEl  = qs("#manabe-step-status");
  if (!stepsWrap || !panelText) return;
  var btns = qsa(".scientist-step", stepsWrap);
  if (!btns.length) return;

  var SVG_IDS = ["manabe-arrow-solar","manabe-arrow-ghg","manabe-arrow-convection","manabe-arrow-surface",null];

  function activateStep(index) {
    btns.forEach(function(btn, i) {
      btn.setAttribute("aria-pressed", i === index ? "true" : "false");
      btn.classList.toggle("scientist-step--active", i === index);
    });
    panelText.textContent = MANABE_STEPS[index] || "";
    var label = btns[index].querySelector(".scientist-step__label");
    if (statusEl && label) {
      statusEl.textContent = "Showing: " + label.textContent.trim() + ".";
    }
    var allSvgEls = qsa(".manabe-svg-element");
    allSvgEls.forEach(function(el) { el.classList.remove("is-highlighted"); el.classList.add("is-dimmed"); });
    var targetId = SVG_IDS[index];
    if (targetId) {
      var target = qs("#" + targetId);
      if (target) { target.classList.add("is-highlighted"); target.classList.remove("is-dimmed"); }
    } else {
      allSvgEls.forEach(function(el) { el.classList.remove("is-dimmed"); });
    }
  }
  btns.forEach(function(btn, i) { btn.addEventListener("click", function() { activateStep(i); }); });
  stepsWrap.addEventListener("keydown", function(e) {
    var cur = btns.findIndex(function(b) { return b === document.activeElement; });
    if (cur === -1) return;
    var next = cur;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": e.preventDefault(); e.stopPropagation(); next = (cur + 1) % btns.length; break;
      case "ArrowLeft": case "ArrowUp": e.preventDefault(); e.stopPropagation(); next = (cur - 1 + btns.length) % btns.length; break;
      case "Home": e.preventDefault(); e.stopPropagation(); next = 0; break;
      case "End": e.preventDefault(); e.stopPropagation(); next = btns.length - 1; break;
      case "Enter": case " ": e.preventDefault(); activateStep(cur); return;
      default: return;
    }
    btns[next].focus(); activateStep(next);
  });
  activateStep(0);
}

function initTimelineReveal() {
  if (typeof IntersectionObserver === "undefined") return;
  var timelines = qsa(".timeline-track");
  if (!timelines.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.2 });
  timelines.forEach(function(tl) { observer.observe(tl); });
}
function initHasselmannSlide() {
  initSignalNoiseSlider();
  initSnExplainButtons();
  initFingerprintCards();
}

/* ── Signal/noise slider ──────────────────────────────────────── */

/*
 * The noise line is a hand-crafted polyline. When the slider value
 * increases, we multiply the deviation of each point from the
 * midline by the slider value, making it look more "noisy".
 * No real data — purely conceptual.
 */

// Base noise y-values (deviations from midline 90, x starts at 44, step 11)
var SN_BASE_Y = [
  100,78,118,62,108,55,112,70,105,50,98,65,115,48,102,72,118,55,96,68,
  112,52,100,74,120,58,104,70,116,52,96,68,118,54,100,72,116,55,98,68,
  112,56,100,74,112,58,95
];
var SN_MID   = 90;   // conceptual midline
var SN_X_START = 44;
var SN_X_STEP  = 11;

function buildNoisePoints(amplitude) {
  var pts = [];
  SN_BASE_Y.forEach(function(y, i) {
    var x = SN_X_START + i * SN_X_STEP;
    var dev = (y - SN_MID) * amplitude;
    pts.push(x + "," + (SN_MID + dev));
  });
  return pts.join(" ");
}

function initSignalNoiseSlider() {
  var slider    = qs("#sn-amplitude-slider");
  var noiseLine = qs("#sn-noise-line");
  if (!slider || !noiseLine) return;
  function updateNoise() {
    var rawVal = parseFloat(slider.value) || 0;
    var amp = rawVal / 45;
    if (amp < 0.01) amp = 0;
    noiseLine.setAttribute("points", buildNoisePoints(amp));
  }
  slider.addEventListener("input", function() { updateNoise(); });
  updateNoise();
}
function initSnExplainButtons() {
  var btnWeather = qs("#sn-btn-weather");
  var btnSignal  = qs("#sn-btn-signal");
  var panelText  = qs("#sn-explain-text");
  var statusEl   = qs("#sn-explain-status");

  if (!btnWeather || !btnSignal || !panelText) return;

  function activate(key) {
    var isWeather = key === "weather";
    btnWeather.setAttribute("aria-pressed", isWeather ? "true" : "false");
    btnSignal.setAttribute("aria-pressed",  isWeather ? "false" : "true");
    if (isWeather) {
      btnWeather.classList.add("sn-explain-btn--active");
      btnSignal.classList.remove("sn-explain-btn--active");
    } else {
      btnSignal.classList.add("sn-explain-btn--active");
      btnWeather.classList.remove("sn-explain-btn--active");
    }
    panelText.textContent = SN_TEXTS[key];
    if (statusEl) { statusEl.textContent = "Showing: " + key + " explanation."; }
  }

  btnWeather.addEventListener("click", function() { activate("weather"); });
  btnSignal.addEventListener("click",  function() { activate("signal");  });

  activate("weather");
}


/* ================================================================
   SLIDE 10 — FEEDBACK EXPLORER
   Single-select card group. Keyboard: ArrowLeft/Right/Up/Down,
   Home, End move focus; Enter/Space activate.
   stopPropagation prevents firing the global slide keyboard nav.
   ================================================================ */

var FEEDBACK_TEXTS = [
  "Snow and ice reflect sunlight. If bright surfaces decline, darker land " +
  "or ocean can absorb more solar energy, which can contribute to additional warming.",

  "Water vapour is a greenhouse gas. A warmer atmosphere can contain more " +
  "water vapour, which can strengthen the greenhouse effect.",

  "Changes in temperature with height affect how energy moves through the " +
  "atmosphere and therefore influence the climate response.",

  "Clouds can reflect sunlight and also interact with outgoing infrared " +
  "radiation. Their overall climate effect is complex."
];

function initFingerprintCards() {
  var group    = qs("#fingerprint-cards");
  var panelTxt = qs("#fingerprint-panel-text");
  var statusEl = qs("#fp-status");
  if (!group || !panelTxt) return;
  var cards = qsa(".fingerprint-card", group);
  if (!cards.length) return;

  var FP_TEXTS = [
    "Changes in solar radiation can leave a physically distinctive influence on the climate system.",
    "Volcanic particles can affect atmospheric conditions and radiation.",
    "Increased greenhouse-gas concentrations can leave a characteristic pattern in the climate system."
  ];

  function activateFp(index) {
    cards.forEach(function(card, i) {
      card.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
    panelTxt.textContent = FP_TEXTS[index] || "";
    var heading = cards[index].querySelector(".fingerprint-card__heading");
    if (statusEl && heading) { statusEl.textContent = "Selected: " + heading.textContent.trim(); }
  }
  cards.forEach(function(card, i) { card.addEventListener("click", function() { activateFp(i); }); });
  group.addEventListener("keydown", function(e) {
    var cur = cards.findIndex(function(c) { return c === document.activeElement; });
    if (cur === -1) return;
    var next = cur;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": e.preventDefault(); e.stopPropagation(); next = (cur + 1) % cards.length; break;
      case "ArrowLeft": case "ArrowUp": e.preventDefault(); e.stopPropagation(); next = (cur - 1 + cards.length) % cards.length; break;
      case "Home": e.preventDefault(); e.stopPropagation(); next = 0; break;
      case "End": e.preventDefault(); e.stopPropagation(); next = cards.length - 1; break;
      case "Enter": case " ": e.preventDefault(); activateFp(cur); return;
      default: return;
    }
    cards[next].focus(); activateFp(next);
  });
  activateFp(0);
}
function initFeedbackExplorer() {
  var group    = qs("#feedback-cards");
  var panelTxt = qs("#feedback-panel-text");
  var statusEl = qs("#feedback-status");

  if (!group || !panelTxt) return;

  var cards = qsa(".feedback-card", group);
  if (!cards.length) return;

  function activateFeedback(index) {
    cards.forEach(function(card, i) {
      card.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
    panelTxt.textContent = FEEDBACK_TEXTS[index] || "";
    var label = cards[index].querySelector(".feedback-card__label");
    if (statusEl && label) {
      statusEl.textContent = "Showing: " + label.textContent.trim();
    }
  }

  cards.forEach(function(card, i) {
    card.addEventListener("click", function() { activateFeedback(i); });
  });

  group.addEventListener("keydown", function(e) {
    var cur = cards.findIndex(function(c) { return c === document.activeElement; });
    if (cur === -1) return;
    var next = cur;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown":
        e.preventDefault(); e.stopPropagation();
        next = (cur + 1) % cards.length; break;
      case "ArrowLeft": case "ArrowUp":
        e.preventDefault(); e.stopPropagation();
        next = (cur - 1 + cards.length) % cards.length; break;
      case "Home":
        e.preventDefault(); e.stopPropagation(); next = 0; break;
      case "End":
        e.preventDefault(); e.stopPropagation(); next = cards.length - 1; break;
      case "Enter": case " ":
        e.preventDefault(); activateFeedback(cur); return;
      default: return;
    }
    cards[next].focus();
    activateFeedback(next);
  });

  activateFeedback(0);
}


/* ================================================================
   SLIDE 10 — SCENARIO EXPLORER
   Same single-select pattern as feedback explorer.
   ================================================================ */

var SCENARIO_TEXT =
  "Each pathway is a conditional experiment. It asks: what climate response " +
  "would be possible if these assumptions about future drivers were followed?";

function initScenarioExplorer() {
  var group    = qs("#scenario-cards");
  var panelTxt = qs("#scenario-panel-text");
  var statusEl = qs("#scenario-status");

  if (!group || !panelTxt) return;

  var cards = qsa(".scenario-card", group);
  if (!cards.length) return;

  function activateScenario(index) {
    cards.forEach(function(card, i) {
      card.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
    // All scenarios show the same explanation text
    panelTxt.textContent = SCENARIO_TEXT;
    var label = cards[index].querySelector(".scenario-card__label");
    if (statusEl && label) {
      statusEl.textContent = "Selected: " + label.textContent.trim();
    }
  }

  cards.forEach(function(card, i) {
    card.addEventListener("click", function() { activateScenario(i); });
  });

  group.addEventListener("keydown", function(e) {
    var cur = cards.findIndex(function(c) { return c === document.activeElement; });
    if (cur === -1) return;
    var next = cur;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown":
        e.preventDefault(); e.stopPropagation();
        next = (cur + 1) % cards.length; break;
      case "ArrowLeft": case "ArrowUp":
        e.preventDefault(); e.stopPropagation();
        next = (cur - 1 + cards.length) % cards.length; break;
      case "Home":
        e.preventDefault(); e.stopPropagation(); next = 0; break;
      case "End":
        e.preventDefault(); e.stopPropagation(); next = cards.length - 1; break;
      case "Enter": case " ":
        e.preventDefault(); activateScenario(cur); return;
      default: return;
    }
    cards[next].focus();
    activateScenario(next);
  });

  activateScenario(0);
}


/* ================================================================
   SLIDE 11 — CONCLUSION NAVIGATION BUTTONS
   "Back to beginning" and "Review evidence" scroll to slides.
   "Open source log" is a plain <a href="#references"> — no JS needed.
   ================================================================ */

function initConclusionNav() {
  var btnStart    = qs("#btn-back-start");
  var btnEvidence = qs("#btn-review-evidence");

  if (btnStart) {
    btnStart.addEventListener("click", function() {
      scrollToSlide(0);  // slide 1 = index 0
    });
  }

  if (btnEvidence) {
    btnEvidence.addEventListener("click", function() {
      // Find the evidence slide by id
      var evidenceSlide = qs("#slide-evidence");
      if (!evidenceSlide) return;
      var idx = slides.indexOf(evidenceSlide);
      if (idx !== -1) { scrollToSlide(idx); }
    });
  }
}


/* ================================================================
   TEMPERATURE GRAPH — NASA GISTEMP v4
   Loads the local CSV, draws an inline SVG line chart, and
   provides tooltip interaction and a keyboard-accessible data table.

   file:// compatibility:
   fetch() is blocked on file:// in most browsers.
   If it fails, we show the fallback message rather than fake data.
   ================================================================ */

function initTemperatureGraph() {
  var svgEl    = qs("#temp-graph-svg");
  var fallback = qs("#temp-graph-fallback");
  var loadMsg  = qs("#tg-loading-msg");

  if (!svgEl) return;

  /* ── If inline data is available (always on file://), use it directly ── */
  if (typeof GISTEMP_INLINE !== "undefined" && GISTEMP_INLINE.length > 0) {
    if (loadMsg) loadMsg.setAttribute("display", "none");
    drawTemperatureGraph(svgEl, GISTEMP_INLINE);
    wireTableButton(GISTEMP_INLINE);
    return;
  }

  /* ── Otherwise attempt fetch (works on localhost / HTTPS) ── */
  fetch("data/nasa-gistemp-global-annual.csv")
    .then(function(resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.text();
    })
    .then(function(csvText) {
      var data = parseGistempCsv(csvText);
      if (!data || data.length === 0) {
        throw new Error("No data rows parsed");
      }
      drawTemperatureGraph(svgEl, data);
      wireTableButton(data);
    })
    .catch(function(err) {
      console.warn("[temp-graph] Could not load CSV:", err.message);
      if (loadMsg)  loadMsg.setAttribute("display", "none");
      if (fallback) fallback.removeAttribute("hidden");
    });
}


/* ── 2. CSV parser (skips # comment lines) ──────────────────────── */
function parseGistempCsv(text) {
  var rows = [];
  var lines = text.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === "#" || line === "year,anomaly_c") continue;
    var parts = line.split(",");
    if (parts.length < 2) continue;
    var year = parseInt(parts[0], 10);
    var anom = parseFloat(parts[1]);
    if (isNaN(year) || isNaN(anom)) continue;
    rows.push({ year: year, anomaly: anom });
  }
  return rows.sort(function(a, b) { return a.year - b.year; });
}


/* ── 3. Draw the SVG chart ──────────────────────────────────────── */
function drawTemperatureGraph(svgEl, data) {
  /* Layout constants (match viewBox="0 0 760 300") */
  var VW = 760, VH = 300;
  var PAD_L = 54, PAD_R = 24, PAD_T = 24, PAD_B = 42;
  var W = VW - PAD_L - PAD_R;
  var H = VH - PAD_T - PAD_B;

  var years    = data.map(function(d) { return d.year; });
  var anomalies = data.map(function(d) { return d.anomaly; });
  var minYear = years[0], maxYear = years[years.length - 1];
  var minVal  = Math.min.apply(null, anomalies);
  var maxVal  = Math.max.apply(null, anomalies);

  /* Helpers */
  function xPx(yr) {
    return PAD_L + ((yr - minYear) / (maxYear - minYear)) * W;
  }
  function yPx(val) {
    return PAD_T + H - ((val - minVal) / (maxVal - minVal)) * H;
  }

  /* Clear loading message */
  var loadMsg = svgEl.querySelector("#tg-loading-msg");
  if (loadMsg) loadMsg.parentNode.removeChild(loadMsg);

  /* ── Background ── */
  var bg = svgNS("rect");
  bg.setAttribute("width", VW); bg.setAttribute("height", VH);
  bg.setAttribute("fill", "#060c18");
  svgEl.appendChild(bg);

  /* ── Zero line ── */
  var zeroY = yPx(0);
  var zeroLine = svgNS("line");
  zeroLine.setAttribute("x1", PAD_L); zeroLine.setAttribute("x2", VW - PAD_R);
  zeroLine.setAttribute("y1", zeroY); zeroLine.setAttribute("y2", zeroY);
  zeroLine.setAttribute("stroke", "#2a4a80"); zeroLine.setAttribute("stroke-width", "1");
  zeroLine.setAttribute("stroke-dasharray", "4 3");
  svgEl.appendChild(zeroLine);

  /* Zero label */
  var zeroLbl = svgNS("text");
  zeroLbl.setAttribute("x", PAD_L - 4); zeroLbl.setAttribute("y", zeroY + 4);
  zeroLbl.setAttribute("font-family", "Consolas,monospace");
  zeroLbl.setAttribute("font-size", "9");
  zeroLbl.setAttribute("fill", "#6a80a0");
  zeroLbl.setAttribute("text-anchor", "end");
  zeroLbl.textContent = "0";
  svgEl.appendChild(zeroLbl);

  /* ── Y-axis ticks ── */
  var yTicks = [-0.5, 0, 0.5, 1.0];
  yTicks.forEach(function(tv) {
    if (tv < minVal || tv > maxVal) return;
    var ty = yPx(tv);
    var tick = svgNS("line");
    tick.setAttribute("x1", PAD_L - 4); tick.setAttribute("x2", PAD_L);
    tick.setAttribute("y1", ty); tick.setAttribute("y2", ty);
    tick.setAttribute("stroke", "#2a4a80"); tick.setAttribute("stroke-width", "1");
    svgEl.appendChild(tick);
    var tlbl = svgNS("text");
    tlbl.setAttribute("x", PAD_L - 6); tlbl.setAttribute("y", ty + 4);
    tlbl.setAttribute("font-family", "Consolas,monospace"); tlbl.setAttribute("font-size", "9");
    tlbl.setAttribute("fill", "#6a80a0"); tlbl.setAttribute("text-anchor", "end");
    tlbl.textContent = (tv > 0 ? "+" : "") + tv.toFixed(1);
    svgEl.appendChild(tlbl);
  });

  /* ── X-axis decade labels ── */
  var decades = [];
  for (var yr = Math.ceil(minYear / 20) * 20; yr <= maxYear; yr += 20) {
    decades.push(yr);
  }
  decades.forEach(function(yr) {
    var tx = xPx(yr);
    var xlbl = svgNS("text");
    xlbl.setAttribute("x", tx); xlbl.setAttribute("y", VH - PAD_B + 16);
    xlbl.setAttribute("font-family", "Consolas,monospace"); xlbl.setAttribute("font-size", "9");
    xlbl.setAttribute("fill", "#6a80a0"); xlbl.setAttribute("text-anchor", "middle");
    xlbl.textContent = yr;
    svgEl.appendChild(xlbl);
  });

  /* ── Y-axis label ── */
  var yaxisLbl = svgNS("text");
  yaxisLbl.setAttribute("x", 10); yaxisLbl.setAttribute("y", PAD_T + H / 2);
  yaxisLbl.setAttribute("font-family", "Consolas,monospace"); yaxisLbl.setAttribute("font-size", "9");
  yaxisLbl.setAttribute("fill", "#6a80a0"); yaxisLbl.setAttribute("text-anchor", "middle");
  yaxisLbl.setAttribute("transform", "rotate(-90 10 " + (PAD_T + H / 2) + ")");
  yaxisLbl.textContent = "Anomaly (°C)";
  svgEl.appendChild(yaxisLbl);

  /* ── Main data line ── */
  var pts = data.map(function(d) {
    return xPx(d.year).toFixed(2) + "," + yPx(d.anomaly).toFixed(2);
  }).join(" ");

  var line = svgNS("polyline");
  line.setAttribute("points", pts);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#38bdf8");
  line.setAttribute("stroke-width", "1.5");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("opacity", "0.8");
  svgEl.appendChild(line);

  /* ── 5-year moving average ── */
  var maData = computeMovingAverage(data, 5);
  var maPts = maData.map(function(d) {
    return xPx(d.year).toFixed(2) + "," + yPx(d.ma).toFixed(2);
  }).join(" ");
  var maLine = svgNS("polyline");
  maLine.setAttribute("points", maPts);
  maLine.setAttribute("fill", "none");
  maLine.setAttribute("stroke", "#f5a623");
  maLine.setAttribute("stroke-width", "2.5");
  maLine.setAttribute("stroke-linejoin", "round");
  maLine.setAttribute("stroke-linecap", "round");
  svgEl.appendChild(maLine);

  /* ── Legend ── */
  addLegendItem(svgEl, PAD_L + 4, PAD_T + 14, "#38bdf8", "Annual anomaly");
  addLegendItem(svgEl, PAD_L + 110, PAD_T + 14, "#f5a623", "5-year moving average (calculated from annual values)");

  /* ── Warm-coloured region (above zero) ── */
  var warmPts = [];
  var coldPts = [];
  data.forEach(function(d) {
    var x = xPx(d.year), y = yPx(d.anomaly);
    if (d.anomaly > 0) warmPts.push([x, y]);
  });

  /* ── Hover interaction ── */
  wireGraphHover(svgEl, data, xPx, yPx, PAD_L, W, minYear, maxYear);
}

/* SVG namespace helper */
function svgNS(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function addLegendItem(svgEl, x, y, colour, label) {
  var line = svgNS("line");
  line.setAttribute("x1", x); line.setAttribute("x2", x + 20);
  line.setAttribute("y1", y); line.setAttribute("y2", y);
  line.setAttribute("stroke", colour); line.setAttribute("stroke-width", "2");
  svgEl.appendChild(line);
  var txt = svgNS("text");
  txt.setAttribute("x", x + 24); txt.setAttribute("y", y + 4);
  txt.setAttribute("font-family", "Consolas,monospace"); txt.setAttribute("font-size", "9");
  txt.setAttribute("fill", "#a8b8d0");
  txt.textContent = label;
  svgEl.appendChild(txt);
}

/* 5-year centred moving average */
function computeMovingAverage(data, window) {
  var half = Math.floor(window / 2);
  var result = [];
  for (var i = half; i < data.length - half; i++) {
    var sum = 0;
    for (var j = i - half; j <= i + half; j++) { sum += data[j].anomaly; }
    result.push({ year: data[i].year, ma: sum / window });
  }
  return result;
}

/* ── 4. Hover / focus interactions ─────────────────────────────── */
function wireGraphHover(svgEl, data, xPx, yPx, padL, W, minYear, maxYear) {
  var tooltip   = qs("#temp-tooltip");
  var ttYear    = qs("#tt-year");
  var ttVal     = qs("#tt-val");
  var wrap      = svgEl.parentNode;
  if (!tooltip || !ttYear || !ttVal) return;

  /* Vertical indicator line (drawn once, repositioned on hover) */
  var indicator = svgNS("line");
  indicator.setAttribute("y1", 24); indicator.setAttribute("y2", 258);
  indicator.setAttribute("stroke", "#38bdf8"); indicator.setAttribute("stroke-width", "1");
  indicator.setAttribute("stroke-dasharray", "3 2"); indicator.setAttribute("opacity", "0");
  svgEl.appendChild(indicator);

  function findNearest(svgX) {
    var yearFloat = minYear + ((svgX - padL) / W) * (maxYear - minYear);
    var nearest = data.reduce(function(prev, curr) {
      return Math.abs(curr.year - yearFloat) < Math.abs(prev.year - yearFloat) ? curr : prev;
    });
    return nearest;
  }

  function showTooltip(svgX, svgY, d) {
    var vbScale = svgEl.clientWidth / 760;
    indicator.setAttribute("x1", svgX); indicator.setAttribute("x2", svgX);
    indicator.setAttribute("opacity", "0.6");
    ttYear.textContent = d.year;
    ttVal.textContent  = (d.anomaly >= 0 ? "+" : "") + d.anomaly.toFixed(2) + " °C";
    tooltip.removeAttribute("hidden");
    /* Position tooltip relative to the wrap div */
    var tipX = (xPx(d.year) * vbScale) + 8;
    var tipY = (yPx(d.anomaly) * (svgEl.clientHeight / 300)) - 10;
    tooltip.style.left = Math.min(tipX, svgEl.clientWidth - 120) + "px";
    tooltip.style.top  = Math.max(0, tipY) + "px";
  }

  function hideTooltip() {
    indicator.setAttribute("opacity", "0");
    tooltip.setAttribute("hidden", "");
  }

  /* Mouse events */
  svgEl.addEventListener("mousemove", function(e) {
    var rect    = svgEl.getBoundingClientRect();
    var ratio   = 760 / rect.width;
    var svgX    = (e.clientX - rect.left) * ratio;
    if (svgX < 54 || svgX > 736) { hideTooltip(); return; }
    var d = findNearest(svgX);
    showTooltip(xPx(d.year), yPx(d.anomaly), d);
  });
  svgEl.addEventListener("mouseleave", hideTooltip);

  /* Keyboard: left/right arrows cycle through years */
  var kbIndex = data.length - 1;
  svgEl.addEventListener("keydown", function(e) {
    if (e.key === "ArrowRight") { e.stopPropagation(); kbIndex = Math.min(kbIndex + 1, data.length - 1); }
    else if (e.key === "ArrowLeft") { e.stopPropagation(); kbIndex = Math.max(kbIndex - 1, 0); }
    else if (e.key === "Home") { e.stopPropagation(); kbIndex = 0; }
    else if (e.key === "End")  { e.stopPropagation(); kbIndex = data.length - 1; }
    else return;
    var d = data[kbIndex];
    showTooltip(xPx(d.year), yPx(d.anomaly), d);
  });
  svgEl.addEventListener("blur", hideTooltip);
}


/* ── 5. Data table toggle ───────────────────────────────────────── */
function wireTableButton(data) {
  var btn   = qs("#temp-table-btn");
  var table = qs("#temp-data-table");
  var tbody = qs("#temp-table-body");
  if (!btn || !table || !tbody) return;

  /* Pick ~12 representative years spread across the dataset */
  var SAMPLE_YEARS = [1880, 1900, 1920, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2016, 2020, 2023, 2024, 2025];
  var byYear = {};
  data.forEach(function(d) { byYear[d.year] = d.anomaly; });

  SAMPLE_YEARS.forEach(function(yr) {
    if (byYear[yr] === undefined) return;
    var anom = byYear[yr];
    var tr = document.createElement("tr");
    var tdYr  = document.createElement("td");
    var tdVal = document.createElement("td");
    tdYr.textContent  = yr;
    tdVal.textContent = (anom >= 0 ? "+" : "") + anom.toFixed(2);
    tdVal.style.color = anom > 0 ? "#fdba74" : "#7dd3fc";
    tr.appendChild(tdYr);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  });

  btn.addEventListener("click", function() {
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen = !isOpen;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) { table.removeAttribute("hidden"); }
    else        { table.setAttribute("hidden", ""); }
  });
}


/* ================================================================
   MEDIA REVIEW PANEL — show/hide
   Hidden by default for presentation mode.
   Shown when:  URL contains ?review=1
             OR user presses Shift+R (while not in a text field)
   ================================================================ */

function initMediaReviewPanel() {
  var panel = qs("#media-review");
  if (!panel) return;

  // Check URL param
  if (window.location.search.indexOf("review=1") !== -1) {
    panel.removeAttribute("hidden");
    console.info("[media-review] Shown via ?review=1");
  }

  // Keyboard shortcut: Shift+R
  document.addEventListener("keydown", function(e) {
    if (isTypingContext(e)) return;
    if (e.key === "R" && e.shiftKey) {
      e.preventDefault();
      if (panel.hasAttribute("hidden")) {
        panel.removeAttribute("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        console.info("[media-review] Shown via Shift+R");
      } else {
        panel.setAttribute("hidden", "");
        console.info("[media-review] Hidden via Shift+R");
      }
    }
  });
}

/* ================================================================
   STARTUP DUPLICATE SRC CHECK
   Logs a clear warning if any <img> or <video> source file is
   rendered more than once on the page.
   ================================================================ */

function checkDuplicateMediaSources() {
  var seen = {};

  // Check <img src>
  qsa("img[src]").forEach(function(el) {
    var src = el.getAttribute("src");
    if (!src || src.indexOf("assets/") === -1) return;
    seen[src] = (seen[src] || 0) + 1;
  });

  // Check <video> <source src>
  qsa("video source[src]").forEach(function(el) {
    var src = el.getAttribute("src");
    if (!src || src.indexOf("assets/") === -1) return;
    seen[src] = (seen[src] || 0) + 1;
  });

  var duplicates = Object.keys(seen).filter(function(k) { return seen[k] > 1; });

  if (duplicates.length > 0) {
    duplicates.forEach(function(src) {
      console.warn(
        "[media-check] DUPLICATE MEDIA: " + src +
        " is rendered " + seen[src] + " times on the page. " +
        "Each file should appear in at most one active location."
      );
    });
  } else {
    console.info("[media-check] PASS — no media file is rendered more than once.");
  }
}
