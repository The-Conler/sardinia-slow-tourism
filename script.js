
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav], [data-nav-left]");
const filterButtons = document.querySelectorAll("[data-filter]");
const packageCards = document.querySelectorAll(".package-card");
const destinationFilterButtons = document.querySelectorAll("[data-destination-filter]");
const destinationCards = document.querySelectorAll("[data-destination-card]");
const destinationEmptyState = document.querySelector("[data-destination-empty]");
const destinationResetButton = document.querySelector("[data-destination-reset]");
const partnerFilterButtons = document.querySelectorAll("[data-partner-filter]");
const partnerCards = document.querySelectorAll("[data-partner-card]");
const heroMedia = document.querySelector(".hero-media"); /* legacy; homepage now uses Hero 01 */
const promoMedia = document.querySelector(".promo-media");
const detailHeroMedia = document.querySelector(".detail-hero-media");
const detailLandingMedia = document.querySelector(".detail-landing-media");
const clickableCards = document.querySelectorAll("[data-link]");

if (toggle && nav) {
  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", () => {
    document.querySelectorAll("[data-nav-left], [data-nav-right], [data-nav]").forEach((el) => el.classList.toggle("is-open"));
    toggle.setAttribute("aria-expanded", String(nav.classList.contains("is-open")));
  });

  document.querySelectorAll("[data-nav-left] a, [data-nav-right] a, [data-nav] a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll("[data-nav-left], [data-nav-right], [data-nav]").forEach((el) => el.classList.remove("is-open"));
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

clickableCards.forEach((card) => {
  const link = card.dataset.link;

  if (!link) {
    return;
  }

  card.tabIndex = 0;
  card.setAttribute("role", "link");

  const goToLink = () => {
    window.location.href = link;
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    goToLink();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToLink();
    }
  });
});

const animatePackageCards = (cards) => {
  if (!window.gsap || !cards.length) {
    return;
  }

  gsap.fromTo(
    cards,
    { y: 28, autoAlpha: 0, scale: 0.97 },
    {
      y: 0,
      autoAlpha: 1,
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      clearProps: "transform,opacity,visibility",
    }
  );
};

const formMessages = {
  booking: "Thanks! Your trip request is ready and we will get back to you shortly.",
  contact: "Thanks! We received your message and will get back to you shortly.",
  newsletter: "You are on the list for new Sardinia routes and travel updates.",
};

document.querySelectorAll("[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formName = form.dataset.form;
    const status = document.querySelector(`[data-form-status="${formName}"]`);
    const customMessage = form.dataset.successMessage;

    if (status) {
      status.textContent = customMessage || formMessages[formName] || "Thanks! We received your message.";
      status.classList.add("is-success");
    }

    form.reset();
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    packageCards.forEach((card) => {
      const matches = card.dataset.category === category;
      card.classList.toggle("is-hidden", !matches);
    });

    animatePackageCards(
      [...packageCards].filter((card) => card.dataset.category === category)
    );
  });
});

/* mobile: la chip attiva resta visibile nella riga a scorrimento (202610231640) */
function keepChipVisible(button) {
  const row = button && button.closest(".destination-filter-row");
  if (!row || row.scrollWidth <= row.clientWidth + 2) return;
  const left = button.offsetLeft - (row.clientWidth - button.offsetWidth) / 2;
  row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
}

if (destinationFilterButtons.length && destinationCards.length) {
  const destinationFilters = {
    experience: "all",
    town: "all",
  };


  const updateDestinationCards = () => {
    const visibleCards = [];

    destinationCards.forEach((card) => {
      const experiences = (card.dataset.experience || "").split(" ");
      const experienceMatch =
        destinationFilters.experience === "all" || experiences.includes(destinationFilters.experience);
      const townMatch = destinationFilters.town === "all" || card.dataset.town === destinationFilters.town;
      const isVisible = experienceMatch && townMatch;

      card.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visibleCards.push(card);
      }
    });

    if (destinationEmptyState) {
      destinationEmptyState.classList.toggle("is-hidden", visibleCards.length > 0);
    }


  };

  destinationFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterType = button.dataset.destinationFilter;
      const filterValue = button.dataset.filterValue;

      if (!filterType || !filterValue) {
        return;
      }

      destinationFilters[filterType] = filterValue;

      destinationFilterButtons.forEach((item) => {
        if (item.dataset.destinationFilter === filterType) {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        }
      });

      updateDestinationCards();
      keepChipVisible(button);
    });
  });

  if (destinationResetButton) {
    destinationResetButton.addEventListener("click", () => {
      document.querySelectorAll(".destination-filter-row").forEach((r) => r.scrollTo({ left: 0, behavior: "smooth" }));
      destinationFilters.experience = "all";
      destinationFilters.town = "all";

      destinationFilterButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filterValue === "all");
        button.setAttribute("aria-pressed", String(button.dataset.filterValue === "all"));
      });

      updateDestinationCards();
    });
  }

  updateDestinationCards();
}

if (partnerFilterButtons.length && partnerCards.length) {
  const animatePartnerCards = (cards) => {
    if (!window.gsap || !cards.length) {
      return;
    }

    gsap.fromTo(
      cards,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.025,
        clearProps: "transform,opacity,visibility",
      }
    );
  };

  partnerFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterValue = button.dataset.partnerFilter;
      const visibleCards = [];

      partnerFilterButtons.forEach((item) => item.classList.toggle("is-active", item === button));

      partnerCards.forEach((card) => {
        const isVisible = filterValue === "all" || card.dataset.partnerType === filterValue;
        card.classList.toggle("is-hidden", !isVisible);

        if (isVisible) {
          visibleCards.push(card);
        }
      });

      animatePartnerCards(visibleCards);
    });
  });
}


if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (document.querySelector(".page-content")) ScrollTrigger.defaults({ scroller: ".page-content" });
  /* mobile: rivelazioni anticipate e più brevi (202610231640) */
  const MOB = window.matchMedia("(max-width: 760px)").matches;

  const heroTimeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    paused: true,
  });

  heroTimeline
    .from(".brand, .detail-brand", { y: -18, autoAlpha: 0, duration: 0.7 })
    .from(".top-nav, .detail-nav", { y: -22, autoAlpha: 0, duration: 0.7 }, "-=0.55")
    .from(".menu-toggle, .detail-menu-toggle", { y: -18, autoAlpha: 0, duration: 0.55 }, "-=0.5")
    .from(".hero-copy > *:not([data-reveal-01])", { y: 42, autoAlpha: 0, duration: 0.95, stagger: 0.14 }, "-=0.2")
    .from(".detail-landing-copy > *", { y: 42, autoAlpha: 0, duration: 0.95, stagger: 0.12 }, "-=0.2")
    .from(".about-copy > *, .contact-copy > *, .destinations-hero-copy > *, .partner-copy > *", { y: 42, autoAlpha: 0, duration: 0.95, stagger: 0.12 }, "-=0.2")
    .from(".detail-landing-card", { x: 28, autoAlpha: 0, duration: 0.8 }, "-=0.72")
    .from(".about-highlight-card, .contact-info-card, .partner-highlight-card", { x: 28, autoAlpha: 0, duration: 0.8 }, "-=0.72")
    .from(".hero-notes article, .detail-landing-notes article", { y: 24, autoAlpha: 0, duration: 0.75, stagger: 0.1 }, "-=0.45");
  if (MOB) heroTimeline.timeScale(1.8);

  if (heroMedia) {
    const startHeroScale = () => {
      gsap.fromTo(
        heroMedia,
        { scale: 1.12 },
        {
          scale: 1.03,
          duration: 1.6,
          ease: "power2.out",
        }
      );
    };

    startHeroScale();

    gsap.to(heroMedia, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (promoMedia && !promoMedia.closest("#home-contact")) {
    gsap.to(promoMedia, {
      yPercent: 12,
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: ".promo-banner",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (detailLandingMedia) {
    gsap.fromTo(
      detailLandingMedia,
      { scale: 1.14 },
      {
        scale: 1.09,
        duration: 1.6,
        ease: "power2.out",
      }
    );

    gsap.to(detailLandingMedia, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".detail-landing",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (detailHeroMedia) {
    gsap.fromTo(
      detailHeroMedia,
      { scale: 1.12 },
      {
        scale: 1.04,
        duration: 1.6,
        ease: "power2.out",
      }
    );

    gsap.to(detailHeroMedia, {
      yPercent: 9,
      ease: "none",
      scrollTrigger: {
        trigger: ".detail-hero-visual",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  gsap.utils.toArray(".destination-card").forEach((card, index) => {
    gsap.from(card, {
      y: 54,
      autoAlpha: 0,
      scale: 0.96,
      duration: MOB ? 0.5 : 0.9,
      delay: MOB ? 0 : index * 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? card : card,
        start: MOB ? "top 94%" : "top 84%",
      },
    });
  });

  gsap.utils.toArray(".feature-copy > *, .feature-list article, .video-card").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.8,
      delay: MOB ? 0 : index * 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".feature-section",
        start: MOB ? "top 94%" : "top 70%",
      },
    });
  });

  gsap.utils.toArray(".section-heading > *, .filter-tabs").forEach((item, index) => {
    gsap.from(item, {
      y: 26,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.7,
      delay: MOB ? 0 : index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".packages",
        start: MOB ? "top 94%" : "top 76%",
      },
    });
  });

  gsap.utils.toArray(".package-card").forEach((card, index) => {
    gsap.from(card, {
      y: 40,
      autoAlpha: 0,
      scale: 0.97,
      duration: MOB ? 0.5 : 0.72,
      delay: MOB ? 0 : index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? card : ".package-grid",
        start: MOB ? "top 94%" : "top 76%",
      },
    });
  });

  gsap.utils.toArray(".promo-content > *:not([data-reveal-01])").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.85,
      delay: MOB ? 0 : index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".promo-banner",
        start: MOB ? "top 94%" : "top 72%",
      },
    });
  });

  gsap.utils.toArray(".detail-story-copy > *, .detail-feature-list article, .detail-story-shot").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.82,
      delay: MOB ? 0 : index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".detail-story-section",
        start: MOB ? "top 94%" : "top 74%",
      },
    });
  });

  gsap.utils.toArray(".detail-step-card").forEach((card, index) => {
    gsap.from(card, {
      y: 38,
      autoAlpha: 0,
      scale: 0.97,
      duration: MOB ? 0.5 : 0.76,
      delay: MOB ? 0 : index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? card : ".detail-itinerary-grid",
        start: MOB ? "top 94%" : "top 78%",
      },
    });
  });

  gsap.utils.toArray(".detail-inclusion-card").forEach((card, index) => {
    gsap.from(card, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.8,
      delay: MOB ? 0 : index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? card : ".detail-inclusions-grid",
        start: MOB ? "top 94%" : "top 78%",
      },
    });
  });

  gsap.utils.toArray(".destination-filter-panel").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.78,
      delay: MOB ? 0 : index * 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".destinations-list-section",
        start: MOB ? "top 94%" : "top 78%",
      },
    });
  });

  gsap.utils.toArray(".partner-card, .partner-directory-card, .partner-process-list article").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.78,
      delay: MOB ? 0 : index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : item.closest(".partner-section") || item.closest(".partner-process-section"),
        start: MOB ? "top 94%" : "top 78%",
      },
    });
  });

  gsap.utils.toArray(".detail-booking-content > *").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.82,
      delay: MOB ? 0 : index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".detail-booking-band",
        start: MOB ? "top 94%" : "top 76%",
      },
    });
  });

  gsap.utils.toArray(".footer-grid > section, .footer-bottom").forEach((item, index) => {
    gsap.from(item, {
      y: 28,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.8,
      delay: MOB ? 0 : index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : ".site-footer",
        start: MOB ? "top 94%" : "top 82%",
      },
    });
  });

  gsap.utils.toArray(".detail-hero-copy > *, .detail-hero-visual, .detail-main > *, .sidebar-card").forEach((item, index) => {
    gsap.from(item, {
      y: 34,
      autoAlpha: 0,
      duration: MOB ? 0.5 : 0.85,
      delay: MOB ? 0 : index * 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: MOB ? item : item.closest(".detail-page") ? item : ".detail-content-section",
        start: MOB ? "top 94%" : "top 80%",
      },
    });
  });

  animatePackageCards(
    [...packageCards].filter((card) => card.dataset.category === "destination")
  );

  window.addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 300));

  const startHomeIntro = () => {
    heroTimeline.play(0);
  };

  startHomeIntro();
} else {
}

/* bootHomeInteractions runs after initFestivitiesSlider is defined */


/* Festivities horizontal slider (infinite) */
function initFestivitiesSlider() {
  const viewport = document.querySelector("[data-festivities-track-wrap]");
  const track = document.querySelector("[data-festivities-track]");
  const prev = document.querySelector("[data-festivities-prev]");
  const next = document.querySelector("[data-festivities-next]");
  if (!viewport || !track || !prev || !next) return;

  const scroller = viewport;

  if (!track.dataset.loopReady) {
    const originals = Array.from(track.children);
    // Duplicate twice so the loop feels continuous in both directions
    originals.forEach((card) => track.appendChild(card.cloneNode(true)));
    originals.forEach((card) => track.appendChild(card.cloneNode(true)));
    track.dataset.loopReady = "1";
  }

  let wrapping = false;
  let lastScroll = 0;

  const segmentWidth = () => Math.floor(track.scrollWidth / 3);

  const wrapIfNeeded = () => {
    if (wrapping) return;
    const seg = segmentWidth();
    if (seg <= 0) return;
    const x = scroller.scrollLeft;

    // Forward: past end of 2nd copy → jump back one segment
    if (x >= seg * 2) {
      wrapping = true;
      scroller.scrollLeft = x - seg;
      wrapping = false;
      lastScroll = scroller.scrollLeft;
      return;
    }

    // Backward: only when user scrolls left from near the start after having moved
    if (x <= 1 && lastScroll > 10) {
      wrapping = true;
      scroller.scrollLeft = seg + x;
      wrapping = false;
      lastScroll = scroller.scrollLeft;
    }
  };

  const step = () => {
    const card = track.querySelector(".festivity-card");
    if (!card) return 300;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "22") || 22;
    return Math.round(card.getBoundingClientRect().width + gap);
  };

  const go = (dir) => {
    wrapIfNeeded();
    scroller.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  scroller.addEventListener("scroll", () => {
    if (wrapping) return;
    wrapIfNeeded();
    lastScroll = scroller.scrollLeft;
  }, { passive: true });

  // Drag / swipe
  let dragging = false;
  let startX = 0;
  let startLeft = 0;
  scroller.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
    startLeft = scroller.scrollLeft;
    scroller.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    scroller.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    scroller.style.cursor = "grab";
    wrapIfNeeded();
  });
  scroller.addEventListener("touchstart", (e) => {
    dragging = true;
    startX = e.touches[0].clientX;
    startLeft = scroller.scrollLeft;
  }, { passive: true });
  scroller.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    scroller.scrollLeft = startLeft - (e.touches[0].clientX - startX);
  }, { passive: true });
  scroller.addEventListener("touchend", () => {
    dragging = false;
    wrapIfNeeded();
  });

  prev.disabled = false;
  next.disabled = false;
  // Start on first card (Seulo), left-aligned with section content
  requestAnimationFrame(() => {
    scroller.scrollLeft = 0;
    lastScroll = 0;
  });
}

function bootHomeInteractions() {
  initFestivitiesSlider();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootHomeInteractions);
} else {
  bootHomeInteractions();
}

// Reset review panel scroll when the pointer leaves the card.
document.querySelectorAll('.google-reviews__card').forEach((card) => {
  const panel = card.querySelector('.google-reviews__panel');
  if (!panel) return;
  const resetScroll = () => {
    panel.scrollTop = 0;
  };
  card.addEventListener('mouseleave', resetScroll);
  card.addEventListener('blur', resetScroll, true);
});

// Independent galleries for the photos attached to each original review.
document.querySelectorAll('.google-reviews__gallery').forEach((gallery) => {
  const photos = [...gallery.querySelectorAll('.google-reviews__slides img')];
  const counter = gallery.querySelector('.google-reviews__counter');
  let current = 0;
  const move = (direction) => {
    photos[current].hidden = true;
    current = (current + direction + photos.length) % photos.length;
    photos[current].hidden = false;
    counter.textContent = `${current + 1} / ${photos.length}`;
  };
  gallery.querySelectorAll('[data-review-direction]').forEach((button) => {
    button.addEventListener('click', () => move(Number(button.dataset.reviewDirection)));
  });
  gallery.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
});

/**
 * Text Reveal 01 — Slide Up (Details.so vault helper, vanilla port).
 * Expects global gsap + SplitText + ScrollTrigger from CDN.
 */
function revealForceVisible(scope) {
  (scope || document).querySelectorAll("[data-reveal-01]").forEach(function (el) {
    el.style.visibility = "visible";
  });
  document.documentElement.classList.add("js-reveal-done");
}
function textReveal01(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const gsap = window.gsap;
  const SplitText = window.SplitText;
  if (!gsap || !SplitText) {
    revealForceVisible(scope);
    return;
  }

  const CONFIG = {
    lines: { duration: 1, stagger: 0.06, ease: "expo.out" },
    words: { duration: 1, stagger: 0.03, ease: "expo.out" },
    chars: { duration: 0.6, stagger: 0.01, ease: "expo.out" },
    scrollStart: "top 72%",
    scrubStart: "top 80%",
    scrubEnd: "top 20%",
    once: false,
    markers: false,
  };

  const allSplitEls = scope.querySelectorAll("[data-reveal-01]");
  const autoEls = ignoreManual
    ? [...allSplitEls]
    : [...allSplitEls].filter((el) => !el.hasAttribute("data-manual"));

  gsap.set(autoEls, { visibility: "visible" });

  allSplitEls.forEach((el) => {
    const splitType = el.getAttribute("data-reveal-01");
    const c = CONFIG[splitType];
    if (!c) return;

    let type;
    let mask;
    let linesClass;
    let wordsClass;
    let charsClass;

    switch (splitType) {
      case "lines":
        type = "lines";
        mask = "lines";
        linesClass = "line";
        break;
      case "words":
        type = "words, lines";
        mask = "words";
        wordsClass = "word";
        linesClass = "line";
        break;
      case "chars":
        type = "chars, words, lines";
        mask = "chars";
        charsClass = "char";
        wordsClass = "word";
        linesClass = "line";
        break;
      default:
        return;
    }

    if (!ignoreManual && el.hasAttribute("data-manual")) {
      SplitText.create(el, {
        type,
        mask,
        autoSplit: true,
        ...(linesClass && { linesClass }),
        ...(wordsClass && { wordsClass }),
        ...(charsClass && { charsClass }),
      });
      return;
    }

    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";

    SplitText.create(el, {
      type,
      mask,
      autoSplit: true,
      ...(linesClass && { linesClass }),
      ...(wordsClass && { wordsClass }),
      ...(charsClass && { charsClass }),
      onSplit(instance) {
        const durationValue = parseFloat(el.dataset.duration);
        const staggerValue = parseFloat(el.dataset.stagger);
        const delayValue = parseFloat(el.dataset.delay);
        const duration = Number.isNaN(durationValue) ? c.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? c.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = el.dataset.ease || c.ease;
        const targets = instance[splitType];
        const once = el.hasAttribute("data-once")
          ? el.getAttribute("data-once") !== "false"
          : CONFIG.once;

        const tween = {
          yPercent: 110,
          duration,
          stagger,
          delay: useScroll ? elDelay : elDelay + delay,
          immediateRender: true,
          ease,
        };

        if (useScrub) {
          tween.scrollTrigger = {
            trigger: el,
            start: CONFIG.scrubStart,
            end: CONFIG.scrubEnd,
            scrub: true,
            markers: CONFIG.markers,
            ...(once && { onLeave: (self) => self.kill(false) }),
          };
        } else if (useScroll) {
          const start = scrollMode || CONFIG.scrollStart;
          tween.scrollTrigger = {
            trigger: el,
            start: `clamp(${start})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions: "play none none reverse" }),
          };
        }

        return gsap.from(targets, tween);
      },
    });
  });
}

function bootTextReveal01() {
  const nodes = document.querySelectorAll("[data-reveal-01]");
  if (!nodes.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((el) => {
      el.style.visibility = "visible";
    });
    return;
  }

  if (!window.gsap || !window.SplitText) {
    console.warn("[textReveal01] GSAP SplitText unavailable — showing text unhidden.");
    nodes.forEach((el) => {
      el.style.visibility = "visible";
    });
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
  try {
    hero01();
  } catch (err) {
    console.warn("[hero01] failed", err);
  }
  try {
    textReveal01(document, document.querySelector("[data-hero-01]") ? 2.24 : 0);
  } catch (err) {
    console.warn("[textReveal01] failed", err);
    revealForceVisible(document);
  }
  document.documentElement.classList.add("gsap-ready");
}

/* Hero 01 — media clip-path window -> full frame, image scale, overlay fade */
function hero01() {
  const gsap = window.gsap;
  const media = document.querySelector("[data-hero-01-media]");
  if (!gsap || !media) return;
  const image = media.querySelector(".hero-01__image");
  const overlay = media.querySelector("[data-hero-01-overlay]");
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.set(media, { clipPath: "polygon(50% 20%, 50% 20%, 50% 80%, 50% 80%)" })
    .set(image, { scale: 1 })
    .set(overlay, { autoAlpha: 0 })
    .to(media, { clipPath: "polygon(35% 20%, 65% 20%, 65% 80%, 35% 80%)", duration: 1.4, ease: "power2.inOut" })
    .to(image, { scale: 0.86, duration: 1.4, ease: "power2.inOut" }, "<")
    .to(media, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.65, ease: "power4.inOut" }, "-=.1")
    .to(image, { scale: 1, duration: 1.65, ease: "power4.inOut" }, "<")
    .to(overlay, { autoAlpha: 1, duration: 1.7 }, "<+=.5");
  return tl;
}

(function initTextReveal01WhenReady() {
  const fontsReady =
    document.fonts && document.fonts.ready
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve();
  const domReady =
    document.readyState === "loading"
      ? new Promise((resolve) =>
          document.addEventListener("DOMContentLoaded", resolve, { once: true })
        )
      : Promise.resolve();

  Promise.all([fontsReady, domReady]).then(bootTextReveal01);
})();


/* Sticky frosted header: light text on hero, dark on cream sections */
(function initStickyHeaderTheme() {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;

  const update = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const threshold = Math.max(header.offsetHeight * 0.55, 40);
    const fp = document.querySelector("[data-forpeople]");
    let overDark = false;
    if (fp) { const r = fp.getBoundingClientRect(); overDark = r.top <= threshold && r.bottom > threshold; }
    header.classList.toggle("is-over-light", heroBottom <= threshold && !overDark);
  };

  update();
  (document.querySelector(".page-content") || window).addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

/* Villages explore — light scroll-in (IntersectionObserver; reduced-motion safe) */
(function initVillagesExploreReveal() {
  const section = document.querySelector(".villages-explore");
  if (!section) return;

  const targets = section.querySelectorAll(
    ".villages-explore__intro, .villages-scape, .villages-explore__tile, .villages-explore__tags"
  );
  if (!targets.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  document.documentElement.classList.add("js-villages-anim");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        io.unobserve(entry.target);
      });
    },
    { root: document.querySelector(".page-content"), rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  targets.forEach((el) => io.observe(el));
})();

/* Villages SCAPE — subtle media parallax (GSAP scrub; skipped if unavailable / reduced-motion) */
(function initVillagesScapeParallax() {
  const media = document.querySelector("[data-scape-parallax]");
  if (!media) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  gsap.fromTo(
    media,
    { yPercent: -6 },
    {
      yPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: media.closest(".villages-scape") || media,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
})();


/* ===== Reveal Navigation 3.0 ===== */
function sideRevealNavigation(scope = document) {
  const root = scope.querySelector("[data-side-reveal-navigation]");
  if (!root || !window.gsap) return;
  root.drawerCleanup?.();
  const gsap = window.gsap;
  if (window.CustomEase) gsap.registerPlugin(window.CustomEase);
  const ease = window.CustomEase ? CustomEase.create("sideReveal", "M0,0 C0.595,0 0.005,1 1,1") : "power3.inOut";
  const toggle = root.querySelector("[data-toggle]");
  const menu = root.querySelector(".drawer");
  const page = root.querySelector(".page");
  const content = root.querySelector(".page-content");
  const cover = root.querySelector(".cover");
  const entries = [...root.querySelectorAll("[data-entry]")];
  const divider = root.querySelector(".divider");
  const targets = [page, ...entries, divider].filter(Boolean);
  const styles = new Map(targets.map(node => [node, node.getAttribute("style")]));
  const controller = new AbortController();
  const events = { signal: controller.signal };
  let open = false;
  let timeline;
  let resizeFrame = 0;
  let width = root.clientWidth;
  let height = root.clientHeight;
  let bodyOverflow = "";

  function lock() {
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();
  }
  function unlock() {
    document.body.style.overflow = bodyOverflow;
    window.lenis?.start?.();
  }
  function finishClose() {
    root.removeAttribute("data-active");
    content.inert = false;
    content.removeAttribute("aria-hidden");
    cover.disabled = true;
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
    unlock();
  }
  function build() {
    const progress = timeline ? timeline.progress() : 0;
    const reversed = timeline ? timeline.reversed() : false;
    timeline?.kill();
    const wasActive = root.hasAttribute("data-active");
    root.setAttribute("data-active", "");
    const r = root.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    if (!wasActive) root.removeAttribute("data-active");
    const gap = parseFloat(getComputedStyle(root).getPropertyValue("--drawer-gap")) || 0;
    const scale = 0.96;
    const x = m.left - r.right - gap + (r.width * (1 - scale)) / 2;
    timeline = gsap.timeline({ paused: true, defaults: { duration: 1.16, ease }, onReverseComplete: finishClose });
    timeline
      .fromTo(page, { x: 0, scale: 1, borderRadius: 0 }, { x, scale, borderRadius: 16, force3D: true }, 0)
      .fromTo(entries, { x: 16, y: 10, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.68, stagger: 0.045 }, 0.15);
    if (divider) timeline.fromTo(divider, { scaleX: 0, transformOrigin: "right center" }, { scaleX: 1, duration: 0.68 }, 0.15);
    timeline.progress(progress);
    if (open && !reversed) timeline.play();
    else if (!open && progress > 0) timeline.reverse();
  }
  function setOpen(value, moveFocus = true) {
    if (open === value) return;
    open = value;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    if (open) {
      lock();
      root.setAttribute("data-active", "");
      if (moveFocus) toggle.focus({ preventScroll: true });
      content.inert = true;
      content.setAttribute("aria-hidden", "true");
      cover.disabled = false;
      menu.inert = false;
      menu.setAttribute("aria-hidden", "false");
      timeline.play();
    } else {
      if (moveFocus || menu.contains(document.activeElement)) toggle.focus({ preventScroll: true });
      menu.inert = true;
      menu.setAttribute("aria-hidden", "true");
      if (timeline.progress() === 0) {
        timeline.pause();
        finishClose();
      } else timeline.reverse();
    }
  }

  toggle.addEventListener("click", () => setOpen(!open), events);
  cover.addEventListener("click", () => setOpen(false), events);
  menu.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (href === "#" || link.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        setOpen(false);
        setTimeout(() => {
          content.scrollTo({ top: target.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop, behavior: "smooth" });
        }, 1160);
        return;
      }
    }
    setOpen(false);
  }, events);
  document.addEventListener("keydown", event => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === "Tab") {
      const focusable = [...root.querySelectorAll("button, a[href], input, select, textarea, summary, [tabindex]")]
        .filter(node => node.tabIndex >= 0 && !node.disabled && !node.closest("[inert]") && node.getClientRects().length);
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (!event.shiftKey && (index < 0 || index === focusable.length - 1)) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  }, events);

  const observer = new ResizeObserver(() => {
    if (width === root.clientWidth && height === root.clientHeight) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      build();
    });
  });
  observer.observe(root);
  gsap.set(page, { force3D: true, willChange: "transform" });
  build();
  finishClose();

  function destroy() {
    controller.abort();
    observer.disconnect();
    cancelAnimationFrame(resizeFrame);
    timeline?.kill();
    gsap.killTweensOf(targets);
    open = false;
    finishClose();
    styles.forEach((style, node) => {
      if (style === null) node.removeAttribute("style");
      else node.setAttribute("style", style);
    });
    delete root.drawerCleanup;
  }
  root.drawerCleanup = destroy;
  root.sideRevealNav = { destroy, setOpen };
  return { destroy, setOpen };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => sideRevealNavigation());
else sideRevealNavigation();


/* Forpeople-style pinned horizontal statements ("Siamo per la Barbagia") */
(function initForpeople() {
  const run = () => {
    const sec = document.querySelector("[data-forpeople]");
    if (!sec) return;
    const track = sec.querySelector("[data-forpeople-track]");
    const items = [...sec.querySelectorAll("[data-forpeople-item]")];
    const bgs = [...sec.querySelectorAll("[data-forpeople-bg]")];
    const n = items.length;
    if (!track || n < 2) return;

    sec.style.setProperty("--fp-steps", String(n - 1));

    let current = -1;
    const setActive = (i) => {
      i = Math.max(0, Math.min(n - 1, i | 0));
      if (i === current) return;
      current = i;
      items.forEach((el, k) => el.classList.toggle("is-active", k === i));
      bgs.forEach((el, k) => el.classList.toggle("is-active", k === i));
    };
    setActive(0);

    if (!window.gsap || !window.ScrollTrigger) {
      sec.classList.add("is-fallback");
      const vp = sec.querySelector(".forpeople__viewport");
      if (!vp) return;
      vp.addEventListener("scroll", () => {
        const w = items[0].offsetWidth || 1;
        setActive(Math.round(vp.scrollLeft / w));
      }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll().forEach((st) => {
      if ((st.vars && st.vars.id === "forpeople") || st.trigger === sec) st.kill();
    });

    const dist = () => {
      const w = items[0].getBoundingClientRect().width || items[0].offsetWidth || 1;
      return w * (n - 1);
    };

    const scroller = document.querySelector(".page-content") || window;

    gsap.set(track, { x: 0, force3D: true });
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        id: "forpeople",
        trigger: sec,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))),
      },
    });

    const refresh = () => { try { ScrollTrigger.refresh(); } catch (_) {} };
    bgs.forEach((img) => { if (!img.complete) img.addEventListener("load", refresh, { once: true }); });
    window.addEventListener("load", refresh, { once: true });
    requestAnimationFrame(() => requestAnimationFrame(refresh));
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
