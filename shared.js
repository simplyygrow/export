// ======= SHARED JS - Indo Route Export =======

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollAnimations();
  initFloatingDock();
  initNavbarScroll();
  initContactForm();
  initMobileMenu();
});

// ======= PRELOADER OVERLAY FADE-OUT =======
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Only run preloader once per tab session (prevents showing on every subpage click).
  // However, if the user reloads/refreshes the page, show it.
  const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload' || performance.navigation?.type === 1;

  if (sessionStorage.getItem('indoroute_visited') && !isReload) {
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
  }, { passive: true });

  // Scroll to top on progress indicator click
  const progressContainer = dock.querySelector('.dock-progress');
  if (progressContainer) {
    progressContainer.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}


// ======= NAV SCROLL EFFECT =======
function initNavbarScroll() {
  const header = document.querySelector('.nav-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
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
      // Success notification & Google Form connection
      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Sending Inquiry...';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      // Google Form Submission Endpoint
      const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfTQPhrqVBl_HV4zQIjXuRCHvXHPKL7tzZ9gs3CijBtA47dqQ/formResponse';

      // Map frontend form data to Google Form entry IDs
      const formData = new URLSearchParams();
      formData.append('entry.1049015684', name.value.trim());     // Your Name
      formData.append('entry.180032542', company.value.trim());   // Company Name
      formData.append('entry.1421793675', email.value.trim());   // Email
      formData.append('entry.2086418675', country.value);         // Country
      formData.append('entry.354540709', product.value);         // Product Interest
      formData.append('entry.1997773229', message.value.trim());  // Message

      // Submit via fetch (no-cors)
      fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      .then(() => {
        handleFormSuccess();
      })
      .catch((err) => {
        console.warn('Direct fetch error, fallback submitting via iframe:', err);
        // Fallback: submit via hidden iframe
        submitViaIframe();
      });

      // Secondary fallback trigger after 800ms
      setTimeout(() => {
        if (btn.textContent === 'Sending Inquiry...') {
          handleFormSuccess();
        }
      }, 1000);

      function handleFormSuccess() {
        btn.textContent = '✓ Inquiry Sent Successfully!';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';
        btn.style.opacity = '1';
        form.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      }

      function submitViaIframe() {
        let iframe = document.getElementById('hidden_iframe');
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.name = 'hidden_iframe';
          iframe.id = 'hidden_iframe';
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        }
        
        const tempForm = document.createElement('form');
        tempForm.action = googleFormUrl;
        tempForm.method = 'POST';
        tempForm.target = 'hidden_iframe';

        const fields = {
          'entry.1049015684': name.value.trim(),
          'entry.180032542': company.value.trim(),
          'entry.1421793675': email.value.trim(),
          'entry.2086418675': country.value,
          'entry.354540709': product.value,
          'entry.1997773229': message.value.trim()
        };

        for (const [key, val] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          tempForm.appendChild(input);
        }

        document.body.appendChild(tempForm);
        tempForm.submit();
        setTimeout(() => document.body.removeChild(tempForm), 1000);
      }
    }
  });

  // Clear error styling on input/change
  const clearError = (inputEl, errorId) => {
    inputEl.classList.remove('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  const nameInput = document.getElementById('contactName');
  if (nameInput) nameInput.addEventListener('input', () => clearError(nameInput, 'nameError'));

  const companyInput = document.getElementById('contactCompany');
  if (companyInput) companyInput.addEventListener('input', () => clearError(companyInput, 'companyError'));

  const emailInput = document.getElementById('contactEmail');
  if (emailInput) emailInput.addEventListener('input', () => clearError(emailInput, 'emailError'));

  const countryInput = document.getElementById('contactCountry');
  if (countryInput) countryInput.addEventListener('change', () => clearError(countryInput, 'countryError'));

  const productInput = document.getElementById('contactProduct');
  if (productInput) productInput.addEventListener('change', () => clearError(productInput, 'productError'));

  const messageInput = document.getElementById('contactMessage');
  if (messageInput) messageInput.addEventListener('input', () => clearError(messageInput, 'messageError'));

  function showError(errorId, input, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (input) input.classList.add('error');
  }
}

// ======= MOBILE HAMBURGER MENU =======
function initMobileMenu() {
  const header = document.querySelector('.nav-header');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !header) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    header.classList.toggle('nav-open');
    const icon = toggle.querySelector('i');
    if (icon) {
      if (header.classList.contains('nav-open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    }
  });

  // Close menu when clicking user options/links
  links.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    });
  });

  // Close menu on clicking active site area outside navbar
  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) {
      header.classList.remove('nav-open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}
