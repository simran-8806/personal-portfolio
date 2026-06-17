/* ===================================================================
   SIMRAN CHAUDHARY — PORTFOLIO INTERACTION LAYER
   GSAP landing sequence, ScrollTrigger reveals, glass-nav, mobile drawer
=================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     1. GSAP REGISTRATION
  ----------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* -----------------------------------------------------------
     2. GLASS NAV — ACTIVE SCROLL STATE
  ----------------------------------------------------------- */
  function initStickyNav() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const SCROLL_THRESHOLD = 24;
    let lastKnownState = false;

    const evaluateScroll = () => {
      const shouldBeScrolled = window.scrollY > SCROLL_THRESHOLD;
      if (shouldBeScrolled !== lastKnownState) {
        header.classList.toggle('is-scrolled', shouldBeScrolled);
        lastKnownState = shouldBeScrolled;
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          evaluateScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    evaluateScroll();
  }

  /* -----------------------------------------------------------
     3. RESPONSIVE MOBILE DRAWER
  ----------------------------------------------------------- */
  function initMobileDrawer() {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (!toggle || !drawer || !backdrop) return;

    const drawerLinks = drawer.querySelectorAll('a');
    let isOpen = false;

    const setDrawerState = (open) => {
      isOpen = open;
      drawer.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setDrawerState(!isOpen));
    backdrop.addEventListener('click', () => setDrawerState(false));

    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => setDrawerState(false));
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) setDrawerState(false);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 880 && isOpen) setDrawerState(false);
      }, 150);
    });
  }

  /* -----------------------------------------------------------
     4. SMOOTH SCROLL CUE (HERO -> ABOUT)
  ----------------------------------------------------------- */
  function initScrollCue() {
    const cue = document.getElementById('scrollCue');
    const aboutSection = document.getElementById('about');
    if (!cue || !aboutSection) return;

    cue.addEventListener('click', () => {
      aboutSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* -----------------------------------------------------------
     5. GSAP LANDING SEQUENCER
  ----------------------------------------------------------- */
  function initHeroSequence() {
    const revealEls = gsap.utils.toArray('.hero-reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion) {
      gsap.set(revealEls, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(revealEls, { opacity: 0, y: 28 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.15
    });

    tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.7 })
      .to('.hero__title-line', { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 }, '-=0.35')
      .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.75 }, '-=0.45')
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.7 }, '-=0.45')
      .to('.hero__metrics', { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');

    gsap.fromTo('.hero__glow--violet',
      { opacity: 0, scale: 0.85 },
      { opacity: 0.55, scale: 1, duration: 1.6, ease: 'power2.out', delay: 0.1 }
    );
    gsap.fromTo('.hero__glow--cyan',
      { opacity: 0, scale: 0.85 },
      { opacity: 0.4, scale: 1, duration: 1.6, ease: 'power2.out', delay: 0.3 }
    );

    gsap.fromTo('.circuit-trace__path',
      { strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', delay: 0.6 }
    );
  }

  /* -----------------------------------------------------------
     6. SCROLLTRIGGER — PROJECT CARD ENTRANCE TIMELINE
  ----------------------------------------------------------- */
  function initProjectScrollReveal() {
    const cards = gsap.utils.toArray('[data-project-card]');
    if (!cards.length) return;

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    cards.forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (index % 2) * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  /* -----------------------------------------------------------
     7. SCROLLTRIGGER — GENERIC SECTION FADE-RISE (skills, about, contact)
  ----------------------------------------------------------- */
  function initSectionReveals() {
    if (prefersReducedMotion) return;

    const groups = [
      { selector: '.skill-card', stagger: 0.06 },
      { selector: '.about__highlight', stagger: 0.1 }
    ];

    groups.forEach(({ selector, stagger }) => {
      const items = gsap.utils.toArray(selector);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 24 });

      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger
          });
        }
      });
    });

    gsap.from('.contact__panel', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact__panel',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }

  /* -----------------------------------------------------------
     8. INIT
  ----------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initStickyNav();
    initMobileDrawer();
    initScrollCue();

    if (window.gsap) {
      initHeroSequence();
      if (window.ScrollTrigger) {
        initProjectScrollReveal();
        initSectionReveals();
      }
    } else {
      document.querySelectorAll('.hero-reveal, [data-project-card], .skill-card, .about__highlight')
        .forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }
  });
})();
