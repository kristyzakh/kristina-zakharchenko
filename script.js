// Count-up animation for hero KPI ticker
function animateCountUp(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  const finalText = prefix + target + suffix;
  let done = false;

  function settle() {
    if (done) return;
    done = true;
    el.textContent = finalText;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      settle();
    }
  }
  requestAnimationFrame(tick);

  // rAF is paused while the page isn't rendering (background tab, hidden view),
  // which can strand the counter on a partial value. Guarantee the real number.
  setTimeout(settle, duration + 200);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal-on-scroll for pacing bars and case/job elements
const revealTargets = document.querySelectorAll('.pacing-bar, .case, .situation-log li');
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach((el) => io.observe(el));

// Hero KPI count-up, fires once hero is in view
const kpiTicker = document.querySelector('.kpi-ticker');
if (kpiTicker) {
  const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.count-up').forEach((el) => {
          if (reduceMotion) {
            el.textContent = (el.dataset.prefix || '') + el.dataset.target + (el.dataset.suffix || '');
          } else {
            animateCountUp(el);
          }
        });
        kpiObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  kpiObserver.observe(kpiTicker);
}

// Service category tabs
const serviceNavItems = document.querySelectorAll('.service-nav-item');
serviceNavItems.forEach((item) => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    serviceNavItems.forEach((btn) => {
      const active = btn === item;
      btn.classList.toggle('is-active', active);
      if (active) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    document.querySelectorAll('.service-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === category);
    });
  });
});

// Contact form -> mailto
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:kristyzakharchenko@gmail.com?subject=${subject}&body=${body}`;

    const note = document.getElementById('form-note');
    note.textContent = 'Opening your email app now...';
  });
}
