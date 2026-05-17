/**
 * CloudNova Solutions — Main JavaScript
 * Author: CloudNova Dev Team
 * Features:
 *  - AOS scroll animation initialization
 *  - Sticky navbar with scroll detection
 *  - Animated stat counters
 *  - Canvas particle background
 *  - Pricing plan toggle (monthly/annual)
 *  - Contact form validation & submission
 *  - Back-to-top button
 *  - Active nav link on scroll (Scrollspy)
 *  - Smooth scroll for anchor links
 */

'use strict';

/* ============================================
   1. AOS — ANIMATE ON SCROLL INITIALIZATION
   ============================================
   AOS triggers CSS-based entrance animations
   when elements scroll into the viewport.
   - duration: animation length in milliseconds
   - once: play animation only once per element
   - easing: CSS timing function for smoothness
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {

  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  /* ==========================================
     2. NAVBAR — TRANSPARENT → SOLID ON SCROLL
     ==========================================
     Uses IntersectionObserver on the hero
     section. When hero leaves viewport, the
     navbar class 'scrolled' is added, applying
     a frosted-glass background via CSS.
     ========================================== */
  const navbar    = document.getElementById('mainNavbar');
  const heroSection = document.getElementById('hero');

  const navObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    },
    { threshold: 0.15 }
  );

  if (heroSection) navObserver.observe(heroSection);

  /* ==========================================
     3. SCROLLSPY — ACTIVE NAV LINK HIGHLIGHT
     ==========================================
     Observes all sections and updates the
     .active class on the corresponding nav
     link based on which section is in view.
     ========================================== */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ==========================================
     4. ANIMATED STAT COUNTERS
     ==========================================
     Targets elements with [data-target] in the
     hero section. Once visible, counts up from
     0 to the target value with easing.
     Uses requestAnimationFrame for smooth,
     60fps animation without setInterval.
     ========================================== */
  const statNumbers = document.querySelectorAll('.stat-num[data-target]');

  /**
   * Easing function: easeOutExpo
   * Produces a fast-start, slow-finish curve
   * @param {number} t - progress 0 to 1
   * @returns {number} eased value 0 to 1
   */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * Animate a single counter element.
   * @param {HTMLElement} el - element to animate
   */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    let   startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased    = easeOutExpo(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* Trigger counters when hero stats scroll into view */
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const counterObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          statNumbers.forEach(animateCounter);
          counterObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(heroStats);
  }

  /* ==========================================
     5. CANVAS PARTICLE BACKGROUND
     ==========================================
     Draws animated floating dots on a <canvas>
     element. Each particle has a random position,
     velocity, radius, and opacity. They wrap
     around screen edges. Lines are drawn between
     nearby particles to simulate a "network mesh"
     often associated with cloud/tech aesthetics.
     ========================================== */
  const heroEl  = document.getElementById('hero');
  const canvas  = document.createElement('canvas');
  canvas.id     = 'particleCanvas';
  canvas.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:0;';

  const particleContainer = document.getElementById('particles-canvas');
  if (particleContainer) {
    particleContainer.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');

  /** Resize canvas to match hero dimensions */
  function resizeCanvas() {
    if (!heroEl) return;
    canvas.width  = heroEl.offsetWidth;
    canvas.height = heroEl.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* Particle configuration */
  const PARTICLE_COUNT = 80;
  const MAX_DIST       = 130;   // max distance for line drawing
  const particles      = [];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      /* Wrap around edges */
      if (this.x < 0)             this.x = canvas.width;
      if (this.x > canvas.width)  this.x = 0;
      if (this.y < 0)             this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  /* Populate particles */
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  /**
   * Draw connection lines between nearby particles.
   * Opacity decreases linearly with distance.
   */
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const opacity = 1 - dist / MAX_DIST;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.12})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  /** Main animation loop */
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  /* ==========================================
     6. PRICING TOGGLE — MONTHLY / ANNUAL
     ==========================================
     Reads [data-monthly] and [data-annual]
     attributes on .amount elements and swaps
     the displayed price when the toggle changes.
     Includes a smooth count-up animation on switch.
     ========================================== */
  const pricingSwitch  = document.getElementById('pricingToggle');
  const lblMonthly     = document.getElementById('lblMonthly');
  const lblAnnual      = document.getElementById('lblAnnual');
  const amountElements = document.querySelectorAll('.amount[data-monthly]');

  if (pricingSwitch) {
    pricingSwitch.addEventListener('change', function () {
      const isAnnual = this.checked;

      /* Update toggle labels */
      lblMonthly.classList.toggle('active', !isAnnual);
      lblAnnual.classList.toggle('active', isAnnual);

      /* Animate price change */
      amountElements.forEach((el) => {
        const newPrice = parseInt(
          el.getAttribute(isAnnual ? 'data-annual' : 'data-monthly'),
          10
        );

        /* Quick count-up from current value */
        const current  = parseInt(el.textContent, 10);
        const duration = 500;
        let   startTime = null;

        function stepPrice(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased    = easeOutExpo(progress);
          el.textContent = Math.round(current + (newPrice - current) * eased);
          if (progress < 1) requestAnimationFrame(stepPrice);
        }

        requestAnimationFrame(stepPrice);
      });
    });
  }

  /* ==========================================
     7. CONTACT FORM — VALIDATION & SUBMISSION
     ==========================================
     Uses the Bootstrap 5 validation API.
     On submit:
       1. Prevents default browser submission.
       2. Validates all required fields.
       3. If valid, shows a loading spinner.
       4. Simulates an async API call (setTimeout).
       5. Hides the form and shows a success message.
     In a production project, the setTimeout would
     be replaced by a real fetch() POST to an API.
     ========================================== */
  const contactForm    = document.getElementById('contactForm');
  const formWrapper    = document.getElementById('contactFormWrapper');
  const formSuccess    = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      /* Bootstrap validation check */
      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated');
        return;
      }

      /* Show loading state on button */
      const btn      = contactForm.querySelector('button[type="submit"]');
      const btnText  = btn.querySelector('.btn-text');
      const btnLoad  = btn.querySelector('.btn-loading');

      btn.disabled = true;
      btnText.classList.add('d-none');
      btnLoad.classList.remove('d-none');

      /*
       * Simulate async form submission (500ms delay).
       * In production, replace with:
       *   const response = await fetch('/api/contact', { method:'POST', body: formData });
       */
      try {

const fileInput = document.getElementById("pdfInput");

if (!fileInput || !fileInput.files.length) {
    alert("Please upload a PDF.");
    return;
}

const file = fileInput.files[0];

const endpoint = "https://cloudnova-form-ai.cognitiveservices.azure.com/";
const apiKey = "API_KEY_HERE";

const response = await fetch(
  `${endpoint}/formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      "Ocp-Apim-Subscription-Key": apiKey
    },
    body: file
  }
);
console.log("Response status:", response.status);

const operationLocation = response.headers.get("operation-location");
console.log("Operation URL:", operationLocation);

setTimeout(async () => {

  const resultResponse = await fetch(operationLocation, {
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey
    }
  });

  const result = await resultResponse.json();

  console.log("Form Recognizer Result:", result);

  btn.disabled = false;
  btnText.classList.remove('d-none');
  btnLoad.classList.add('d-none');

  formWrapper.classList.add('d-none');
  formSuccess.classList.remove('d-none');

}, 5000);

} catch (error) {

  btn.disabled = false;
  btnText.classList.remove('d-none');
  btnLoad.classList.add('d-none');

  alert("Something went wrong!");

}
    });
  }

  /* ==========================================
     8. BACK-TO-TOP BUTTON
     ==========================================
     Shows a fixed button in the bottom-right
     corner when the user scrolls past 400px.
     Smooth-scrolls to top on click.
     ========================================== */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================
     9. SMOOTH SCROLL FOR ANCHOR LINKS
     ==========================================
     Intercepts clicks on all [href^="#"] links
     and applies smooth scrolling. Also closes
     the mobile navbar collapse on link click.
     ========================================== */
  const allAnchorLinks   = document.querySelectorAll('a[href^="#"]');
  const navbarCollapse   = document.getElementById('navbarNav');
  const bootstrapCollapse = navbarCollapse
    ? bootstrap.Collapse.getOrCreateInstance(navbarCollapse, { toggle: false })
    : null;

  allAnchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        /* Close mobile menu if open */
        if (bootstrapCollapse && navbarCollapse.classList.contains('show')) {
          bootstrapCollapse.hide();
        }
      }
    });
  });

  /* ==========================================
     10. NEWSLETTER FORM — INLINE VALIDATION
     ==========================================
     Basic email validation for footer newsletter.
     Provides visual feedback without reloading.
     ========================================== */
  const newsletterInput = document.querySelector('.newsletter-input');
  const newsletterBtn   = document.querySelector('.newsletter-btn');

  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', function () {
      const email = newsletterInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        newsletterInput.style.borderColor = 'rgba(255,80,80,0.5)';
        newsletterInput.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.1)';
        setTimeout(() => {
          newsletterInput.style.borderColor = '';
          newsletterInput.style.boxShadow   = '';
        }, 2000);
        return;
      }

      /* Success feedback */
      newsletterBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
      newsletterBtn.style.background = 'linear-gradient(135deg,#00E676,#0070F3)';
      newsletterInput.value = '';
      newsletterInput.placeholder = 'Thank you for subscribing!';
    });

    /* Allow submitting newsletter with Enter key */
    newsletterInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') newsletterBtn.click();
    });
  }

  /* ==========================================
     11. SERVICE CARD HOVER — TILT EFFECT
     ==========================================
     Subtle 3D tilt on service cards on mouse
     movement. Adds depth and interactivity.
     Resets on mouse leave.
     ========================================== */
  const serviceCards = document.querySelectorAll('.service-card');

  serviceCards.forEach((card) => {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) *  5;

      card.style.transform =
        `translateY(-8px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ==========================================
     12. INTERSECTION OBSERVER — COUNTER SECTION
     ==========================================
     Triggers count-up on ALL stat/number elements
     that have a data-target attribute, including
     any added in the About or other sections.
     ========================================== */
  const allCounters = document.querySelectorAll('[data-count]');

  if (allCounters.length > 0) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            animateCounter(el);
            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    allCounters.forEach((counter) => countObserver.observe(counter));
  }

  /* ==========================================
     13. CURSOR GLOW EFFECT (DESKTOP ONLY)
     ==========================================
     Creates a soft radial glow that follows the
     mouse cursor. Adds to the cosmic/tech aesthetic.
     Disabled on touch devices for performance.
     ========================================== */
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: left 0.1s ease, top 0.1s ease;
      z-index: 0;
      will-change: left, top;
    `;
    document.body.appendChild(cursorGlow);

    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }

  /* ==========================================
     14. FAQ ACCORDION — ICON ANIMATION
     ==========================================
     Adds a rotation animation to the FAQ icons
     when their accordion panel opens/closes,
     providing a clear visual affordance.
     ========================================== */
  const faqButtons = document.querySelectorAll('.faq-button');

  faqButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const icon = this.querySelector('.faq-icon');
      if (!icon) return;
      const isExpanding = this.classList.contains('collapsed');
      icon.style.transform = isExpanding ? 'rotate(360deg)' : 'rotate(0deg)';
      icon.style.transition = 'transform 0.3s ease';
      icon.style.color      = isExpanding ? 'var(--cn-cyan)' : 'var(--cn-text-muted)';
    });
  });

  /* ==========================================
     15. PERFORMANCE: PASSIVE SCROLL LISTENERS
     ==========================================
     All scroll event listeners use { passive: true }
     to prevent them from blocking the main thread,
     ensuring smooth 60fps scrolling on all devices.
     ========================================== */

  console.log('%cCloudNova Solutions', 'color:#00D4FF;font-family:Syne;font-size:20px;font-weight:800');
  console.log('%cBuilt with HTML5 · CSS3 · Bootstrap 5 · Vanilla JS', 'color:#8B9FC0;font-size:12px');

}); // end DOMContentLoaded