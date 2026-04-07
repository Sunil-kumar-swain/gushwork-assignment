/**
 * script.js – Mangalam HDPE Pipes Landing Page
 *
 * Features:
 *  1. Sticky header – appears when scrolling past hero, hides on scroll up
 *  2. Image carousel – thumbnail navigation + prev/next arrows
 *  3. Zoom-on-hover – lens + preview panel showing magnified section
 *  4. Manufacturing process stepper – pill tabs switch panels
 *  5. Mobile hamburger nav toggle
 *  6. Scroll-reveal animations (IntersectionObserver)
 */

/* ─────────────────────────────────────────────────
   1. STICKY HEADER
   Appears above main nav when user scrolls past the
   hero section (first fold). Hides when scrolling back.
───────────────────────────────────────────────── */
(function initStickyHeader() {
  const stickyHeader = document.getElementById('sticky-header');
  const hero         = document.getElementById('hero');

  let lastScrollY  = 0;
  let heroBottom   = 0;

  /** Calculate hero bottom position (recalculate on resize) */
  function updateHeroBottom() {
    heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 600;
  }

  function onScroll() {
    const currentY = window.scrollY;

    if (currentY > heroBottom && currentY < lastScrollY) {
      // Scrolling UP and past hero → show sticky header
      stickyHeader.classList.add('visible');
    } else if (currentY <= heroBottom || currentY > lastScrollY) {
      // Scrolling DOWN or back into hero → hide sticky header
      stickyHeader.classList.remove('visible');
    }

    lastScrollY = currentY;
  }

  updateHeroBottom();
  window.addEventListener('scroll',  onScroll,           { passive: true });
  window.addEventListener('resize',  updateHeroBottom,   { passive: true });
})();


/* ─────────────────────────────────────────────────
   2. IMAGE CAROUSEL
   Thumbnails click to set active image; arrows cycle
   through images; active thumbnail highlighted.
───────────────────────────────────────────────── */
(function initCarousel() {
  const mainImg   = document.getElementById('main-img');
  const thumbs    = document.querySelectorAll('.carousel__thumb');
  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');

  // Build src arrays from thumbnails (use higher-res variants)
  const images = Array.from(thumbs).map(t => {
    // Replace thumbnail sizing param with large size
    return t.src.replace('w=200', 'w=700');
  });

  let current = 0;

  /** Switch to given index */
  function goTo(index) {
    // Clamp / wrap
    current = (index + images.length) % images.length;

    // Fade transition
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src           = images[current];
      mainImg.style.opacity = '1';

      // Update zoom preview src too
      zoomUpdateSrc(images[current]);
    }, 200);

    // Update active thumb
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === current);
    });
  }

  // Thumbnail click
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => goTo(i));
  });

  // Arrow buttons
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / swipe support on main image
  let touchStartX = 0;
  const carouselMain = document.getElementById('carousel-main');
  carouselMain.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carouselMain.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Expose for zoom module
  window._carouselGetSrc = () => images[current];
})();


/* ─────────────────────────────────────────────────
   3. ZOOM ON HOVER
   Displays a circular lens on the main image and a
   side-panel preview showing the zoomed area.
   Zoom factor: 2.5×
───────────────────────────────────────────────── */
(function initZoom() {
  const container  = document.getElementById('carousel-main');
  const lens       = document.getElementById('zoom-lens');
  const preview    = document.getElementById('zoom-preview');
  const previewImg = document.getElementById('zoom-preview-img');
  const mainImg    = document.getElementById('main-img');

  const ZOOM_FACTOR = 2.5;   // magnification
  const LENS_R      = 50;    // lens radius in px

  /** Set background-image on the preview div to match main image */
  function zoomUpdateSrc(src) {
    previewImg.style.backgroundImage = `url('${src}')`;
  }
  // Expose so carousel module can call it on image change
  window.zoomUpdateSrc = zoomUpdateSrc;

  // Initial set
  zoomUpdateSrc(mainImg.src);

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();

    // Cursor position relative to container (0–1)
    let rx = (e.clientX - rect.left)  / rect.width;
    let ry = (e.clientY - rect.top)   / rect.height;

    // Clamp so lens stays within image
    const lensRatioX = LENS_R / rect.width;
    const lensRatioY = LENS_R / rect.height;
    rx = Math.max(lensRatioX, Math.min(1 - lensRatioX, rx));
    ry = Math.max(lensRatioY, Math.min(1 - lensRatioY, ry));

    // Position the lens (centred on cursor)
    lens.style.left = `${rx * 100}%`;
    lens.style.top  = `${ry * 100}%`;

    // Calculate background-position for preview
    // When cursor is at (rx, ry) of original, the preview should show that point centred.
    // bg-position = (rx * (zoom-1)) * 100% — but we use pixel offsets for precision.
    const previewW = preview.offsetWidth;
    const previewH = preview.offsetHeight;

    const bgW = previewW * ZOOM_FACTOR;  // bg image width in preview
    const bgH = previewH * ZOOM_FACTOR;

    // Centre the point under cursor
    const bx = -(rx * bgW - previewW / 2);
    const by = -(ry * bgH - previewH / 2);

    previewImg.style.backgroundSize     = `${bgW}px ${bgH}px`;
    previewImg.style.backgroundPosition = `${bx}px ${by}px`;
  }

  container.addEventListener('mousemove', onMouseMove);
})();


/* ─────────────────────────────────────────────────
   4. MANUFACTURING PROCESS STEPPER
   Pill buttons switch between process panels with
   a smooth fade-in animation.
───────────────────────────────────────────────── */
(function initProcessStepper() {
  const pills  = document.querySelectorAll('.process-pill');
  const panels = document.querySelectorAll('.process-panel');

  function activateStep(index) {
    pills.forEach((p, i)  => p.classList.toggle('active', i === index));
    panels.forEach((p, i) => p.classList.toggle('active', i === index));
  }

  pills.forEach((pill, i) => {
    pill.addEventListener('click', () => activateStep(i));
  });
})();


/* ─────────────────────────────────────────────────
   5. MOBILE HAMBURGER MENU
   Toggles the main nav open/closed on small screens.
───────────────────────────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // Animate spans into X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close nav when a link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


/* ─────────────────────────────────────────────────
   6. SCROLL-REVEAL ANIMATIONS
   Elements with class "reveal" fade in when they
   enter the viewport (uses IntersectionObserver).
───────────────────────────────────────────────── */
(function initScrollReveal() {
  // Add reveal class to major block elements
  const targets = document.querySelectorAll(
    '.feature-card, .app-card, .portfolio-card, .testimonial-card, ' +
    '.faq-item, .resource-item, .specs-table, .process-panels, ' +
    '.section-header, .catalogue-box, .not-found-box, .contact-form'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────
   7. CATALOGUE & CONTACT FORMS — basic UX feedback
───────────────────────────────────────────────── */
(function initForms() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const originalText = btn.textContent;
      btn.textContent  = '✓ Submitted!';
      btn.disabled     = true;
      btn.style.opacity = '0.8';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled    = false;
        btn.style.opacity = '';
        form.reset();
      }, 3000);
    });
  });
})();
