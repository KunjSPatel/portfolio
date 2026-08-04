const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const VISITS_WORKER_URL = 'https://portfolio-counter.mysoulrises.workers.dev';

function initVisitTracker() {
  const visitsEl = document.getElementById('visits');
  const lastVisitEl = document.getElementById('last-visit');

  if (!visitsEl || !lastVisitEl) {
    return;
  }

  fetch(VISITS_WORKER_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Visit API failed: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      visitsEl.textContent = String(data.visits ?? '--');

      const date = new Date(data.last_visit);
      lastVisitEl.textContent = Number.isNaN(date.getTime())
        ? '--'
        : date.toLocaleString();
    })
    .catch(() => {
      visitsEl.textContent = '--';
      lastVisitEl.textContent = '--';
    });
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
