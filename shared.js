// ======= SHARED JS - Indo Route Export =======

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollAnimations();
  initFloatingDock();
  initContactForm();
});

// ======= PRELOADER OVERLAY FADE-OUT =======
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Only run preloader once per tab session (prevents showing on every subpage click)
  if (sessionStorage.getItem('indoroute_visited')) {
    preloader.style.transition = 'none';
    preloader.style.display = 'none';
    return;
  }

  // Mark session as visited
  sessionStorage.setItem('indoroute_visited', 'true');

  const startTime = Date.now();
  const minDuration = 2000; // 2 seconds minimum visibility

  // Fade out preloader once window is loaded plus minimum duration check
  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);

    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, remaining);
  });

  // Fallback in case window load doesn't trigger quickly
  setTimeout(() => {
    preloader.classList.add('fade-out');
  }, 5000);
}




// ======= SCROLL FADE-IN ANIMATIONS =======
function initScrollAnimations() {
  const fadeEls = document.querySelectorAll('.fade-up');
  if (!fadeEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => obs.observe(el));
}

// ======= FLOATING DOCK =======
function initFloatingDock() {
  const dock = document.querySelector('.floating-dock');
  if (!dock) return;
  const sectionName = dock.querySelector('.dock-section-name');
  const progressFill = dock.querySelector('.dock-progress-fill');
  const sections = document.querySelectorAll('[data-dock-label]');
  const heroBottom = document.querySelector('.hero-section') || document.querySelector('.cs-hero') || document.querySelector('.start-hero');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH = heroBottom ? heroBottom.offsetHeight : 600;

    // Show/hide dock
    if (scrollY > heroH * 0.7) {
      dock.classList.add('visible');
    } else {
      dock.classList.remove('visible');
    }

    // Update section name
    let currentLabel = 'HOME';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) {
        currentLabel = sec.dataset.dockLabel;
      }
    });
    if (sectionName) sectionName.textContent = currentLabel;

    // Update progress ring
    if (progressFill) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min(scrollY / docH, 1);
      const circumference = 2 * Math.PI * 15;
      progressFill.style.strokeDasharray = circumference;
      progressFill.style.strokeDashoffset = circumference * (1 - pct);
    }
  });
}

// ======= NAV ACTIVE STATE =======
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (path.endsWith('/') && href === 'index.html') link.classList.add('active');
    else if (path.includes('services') && href === 'services.html') link.classList.add('active');
    else if (path.includes('contact') && href === 'contact.html') link.classList.add('active');
    else if (href && path.endsWith(href)) link.classList.add('active');
  });
}
setActiveNav();

// ======= CONTACT FORM VALIDATION =======
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Name
    const name = document.getElementById('contactName');
    if (!name.value.trim()) {
      showError('nameError', name, 'Please enter your name');
      isValid = false;
    }

    // Company
    const company = document.getElementById('contactCompany');
    if (!company.value.trim()) {
      showError('companyError', company, 'Please enter your company name');
      isValid = false;
    }

    // Email
    const email = document.getElementById('contactEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError('emailError', email, 'Please enter your email');
      isValid = false;
    } else if (!emailRegex.test(email.value)) {
      showError('emailError', email, 'Please enter a valid email address');
      isValid = false;
    }

    // Country
    const country = document.getElementById('contactCountry');
    if (!country.value) {
      showError('countryError', country, 'Please select your country');
      isValid = false;
    }

    // Product
    const product = document.getElementById('contactProduct');
    if (!product.value) {
      showError('productError', product, 'Please select a product');
      isValid = false;
    }

    // Message
    const message = document.getElementById('contactMessage');
    if (!message.value.trim()) {
      showError('messageError', message, 'Please enter your message');
      isValid = false;
    }

    if (isValid) {
      // Success notification
      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = '✓ Inquiry Sent!';
      btn.style.background = '#28a745';
      btn.style.color = '#fff';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    }
  });

  function showError(errorId, input, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (input) input.classList.add('error');
  }
}
