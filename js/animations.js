/**
 * Animations & Interactive Experience Engine
 * - Welcome loading screen
 * - Typewriter hero animation
 * - Scroll-reveal triggers
 * - Smooth number counters
 * - Scrollspy navigation
 */

const PortfolioAnimations = {
  // 1. Splash Screen Welcome Loader
  initSplashLoader: function () {
    const splash = document.getElementById('welcome-splash');
    const fill = document.getElementById('splash-progress-fill');
    if (!splash) return;

    // Simulate fast professional loading
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (fill) fill.style.width = '100%';
        
        setTimeout(() => {
          splash.classList.add('hidden');
          document.body.style.overflow = 'auto';
          PortfolioAnimations.triggerHeroEntrance();
        }, 350);
      } else {
        if (fill) fill.style.width = progress + '%';
      }
    }, 60);
  },

  // 2. Hero Section Entrance
  triggerHeroEntrance: function () {
    const heroElements = document.querySelectorAll('#hero .reveal-init');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('revealed');
      }, index * 120);
    });
  },

  // 3. Typewriter Effect
  initTypewriter: function (elementId, phrases) {
    const target = document.getElementById(elementId);
    if (!target || !phrases || phrases.length === 0) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 90;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        target.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 45;
      } else {
        target.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 90;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of phrase
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400;
      }

      setTimeout(type, typeSpeed);
    }

    type();
  },

  // 4. Scroll Reveal with IntersectionObserver
  initScrollReveal: function () {
    const revealElements = document.querySelectorAll('.reveal-init:not(#hero .reveal-init)');

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');

          // If entry contains counter elements, trigger counter
          const counters = entry.target.querySelectorAll('[data-counter-target]');
          counters.forEach(counter => {
            PortfolioAnimations.animateCounter(counter);
          });

          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  },

  // 5. Smooth Number Counter Animation
  animateCounter: function (el) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const targetVal = parseFloat(el.dataset.counterTarget);
    const isFloat = el.dataset.counterFloat === 'true';
    const prefix = el.dataset.counterPrefix || '';
    const suffix = el.dataset.counterSuffix || '';
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = targetVal * easeProgress;

      if (isFloat) {
        el.textContent = `${prefix}${currentVal.toFixed(2)}${suffix}`;
      } else if (targetVal >= 1000) {
        el.textContent = `${prefix}${Math.floor(currentVal).toLocaleString()}${suffix}`;
      } else {
        el.textContent = `${prefix}${Math.floor(currentVal)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (isFloat) {
          el.textContent = `${prefix}${targetVal.toFixed(2)}${suffix}`;
        } else if (targetVal >= 1000) {
          el.textContent = `${prefix}${targetVal.toLocaleString()}${suffix}`;
        } else {
          el.textContent = `${prefix}${targetVal}${suffix}`;
        }
      }
    }

    requestAnimationFrame(update);
  },

  // 6. Navigation Scrollspy & Navbar Backdrop
  initScrollspy: function () {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    function onScroll() {
      const scrollPos = window.scrollY + 120;

      // Navbar scroll effect
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scrollspy section check
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  // 7. Back to Top Button
  initBackToTop: function () {
    const btn = document.getElementById('btn-back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};
