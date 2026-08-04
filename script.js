const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Visit tracking system
function initVisitTracker() {
  const STORAGE_KEYS = {
    total: 'portfolio_total_visits',
    user: 'portfolio_user_visits',
    lastVisit: 'portfolio_last_visit',
    sessionActive: 'portfolio_session_active'
  };

  // Check if this is a new session (not just a page reload within same session)
  const isNewSession = !sessionStorage.getItem(STORAGE_KEYS.sessionActive);

  if (isNewSession) {
    // Mark session as active
    sessionStorage.setItem(STORAGE_KEYS.sessionActive, 'true');

    // Increment counters
    const totalVisits = parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0') + 1;
    const userVisits = parseInt(localStorage.getItem(STORAGE_KEYS.user) || '0') + 1;

    localStorage.setItem(STORAGE_KEYS.total, totalVisits.toString());
    localStorage.setItem(STORAGE_KEYS.user, userVisits.toString());
    localStorage.setItem(STORAGE_KEYS.lastVisit, new Date().toISOString());
  }

  // Display current stats
  const totalVisits = parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0');
  const userVisits = parseInt(localStorage.getItem(STORAGE_KEYS.user) || '0');
  const lastVisit = localStorage.getItem(STORAGE_KEYS.lastVisit);

  // Format last visit date
  let lastVisitFormatted = '--';
  if (lastVisit) {
    const date = new Date(lastVisit);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      lastVisitFormatted = 'just now';
    } else if (diffMins < 60) {
      lastVisitFormatted = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      lastVisitFormatted = `${diffHours}h ago`;
    } else if (diffDays < 30) {
      lastVisitFormatted = `${diffDays}d ago`;
    } else {
      lastVisitFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Update UI
  const totalEl = document.getElementById('totalVisits');
  const userEl = document.getElementById('userVisits');
  const lastEl = document.getElementById('lastVisit');

  if (totalEl) totalEl.textContent = totalVisits.toString();
  if (userEl) userEl.textContent = userVisits.toString();
  if (lastEl) lastEl.textContent = lastVisitFormatted;

  // Animate counter increment
  if (isNewSession && totalEl && userEl) {
    animateCounter(totalEl, totalVisits - 1, totalVisits);
    animateCounter(userEl, userVisits - 1, userVisits);
  }
}

function animateCounter(element, start, end) {
  const duration = 600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);

    element.textContent = current.toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

initVisitTracker();

const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('.nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

// Staggered "typing" reveal for the hero terminal lines
const typedLines = document.querySelectorAll('#typedBody [data-line]');
typedLines.forEach((line, i) => {
  setTimeout(() => line.classList.add('shown'), 200 + i * 220);
});

// Scroll-triggered reveal animations
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));
