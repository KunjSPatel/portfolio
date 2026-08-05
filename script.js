const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const VISITS_WORKER_URL = 'https://portfolio-counter.mysoulrises.workers.dev';
const LIKES_WORKER_URL = `${VISITS_WORKER_URL}/like`;
const LIKED_STORAGE_KEY = 'portfolio_liked';

const likesButtonEl = document.getElementById('like-button');
const likesCountEl = document.getElementById('likes-count');
const likeIconEl = document.querySelector('#like-button .like-icon');

let currentLikes = null;
let isLikedByUser = false;

const COUNTRY_NAME_TO_CODE = {
  canada: 'CA',
  india: 'IN',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  australia: 'AU',
  germany: 'DE',
  france: 'FR',
  italy: 'IT',
  spain: 'ES',
  mexico: 'MX',
  brazil: 'BR',
  japan: 'JP',
  china: 'CN',
  singapore: 'SG',
  'south korea': 'KR',
  netherlands: 'NL',
  sweden: 'SE',
  norway: 'NO',
  switzerland: 'CH',
  ireland: 'IE',
  portugal: 'PT',
  poland: 'PL',
  belgium: 'BE',
  austria: 'AT',
  denmark: 'DK',
  finland: 'FI',
  'new zealand': 'NZ',
  uae: 'AE',
  'united arab emirates': 'AE',
  'saudi arabia': 'SA',
  qatar: 'QA',
  kuwait: 'KW',
  pakistan: 'PK',
  bangladesh: 'BD',
  nepal: 'NP',
  'south africa': 'ZA',
  nigeria: 'NG',
  egypt: 'EG',
  turkey: 'TR',
  indonesia: 'ID',
  malaysia: 'MY',
  thailand: 'TH',
  philippines: 'PH',
  vietnam: 'VN'
};

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatVisitDate(date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${weekday}, ${day}${getOrdinalSuffix(day)} ${month} ${time}`;
}

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function setLikesCount(value) {
  const likes = parseNumber(value);

  if (!likesCountEl) {
    return;
  }

  if (likes === null) {
    likesCountEl.textContent = '--';
    return;
  }

  currentLikes = likes;
  likesCountEl.textContent = String(likes);
}

function readStoredLikeState() {
  try {
    return localStorage.getItem(LIKED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStoredLikeState(isLiked) {
  try {
    localStorage.setItem(LIKED_STORAGE_KEY, isLiked ? '1' : '0');
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }
}

function setLikeButtonState(isLiked) {
  isLikedByUser = Boolean(isLiked);

  if (!likesButtonEl) {
    return;
  }

  likesButtonEl.classList.toggle('is-liked', isLikedByUser);
  likesButtonEl.setAttribute('aria-pressed', String(isLikedByUser));
  likesButtonEl.setAttribute('title', isLikedByUser ? 'Remove like' : 'Like this portfolio');

  if (likeIconEl) {
    likeIconEl.textContent = isLikedByUser ? '♥' : '♡';
  }
}

function countryCodeToFlag(code) {
  if (!code || typeof code !== 'string') {
    return '🌍';
  }

  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) {
    return '🌍';
  }

  return String.fromCodePoint(
    upper.charCodeAt(0) + 127397,
    upper.charCodeAt(1) + 127397
  );
}

function getCountryCode(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (/^[A-Z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const normalizedName = trimmed.toLowerCase();
  return COUNTRY_NAME_TO_CODE[normalizedName] ?? null;
}

function normalizeCountryEntries(rawCountries) {
  if (!rawCountries) {
    return [];
  }

  if (Array.isArray(rawCountries)) {
    return rawCountries
      .map((entry) => {
        if (Array.isArray(entry) && entry.length >= 2) {
          return {
            country: String(entry[0] ?? '').trim(),
            code: getCountryCode(String(entry[0] ?? '').trim()),
            count: parseNumber(entry[1])
          };
        }

        if (entry && typeof entry === 'object') {
          const countryLabel = String(entry.country ?? entry.name ?? entry.code ?? '').trim();
          const countryCode = getCountryCode(String(entry.code ?? countryLabel).trim());

          return {
            country: countryLabel,
            code: countryCode,
            count: parseNumber(entry.count ?? entry.visits ?? entry.value)
          };
        }

        return { country: '', code: null, count: null };
      })
      .filter((entry) => entry.country && entry.count !== null)
      .sort((a, b) => b.count - a.count);
  }

  if (typeof rawCountries === 'object') {
    return Object.entries(rawCountries)
      .map(([country, count]) => ({
        country: String(country).trim(),
        code: getCountryCode(String(country).trim()),
        count: parseNumber(count)
      }))
      .filter((entry) => entry.country && entry.count !== null)
      .sort((a, b) => b.count - a.count);
  }

  return [];
}

function renderCountryStats(rawCountries) {
  const countryListEl = document.getElementById('country-list');
  if (!countryListEl) {
    return;
  }

  const entries = normalizeCountryEntries(rawCountries);

  if (entries.length === 0) {
    countryListEl.innerHTML = '<span class="country-empty">--</span>';
    return;
  }

  countryListEl.innerHTML = entries
    .map((entry) => {
      const flag = countryCodeToFlag(entry.code ?? entry.country);
      return `
      <span class="country-pill" title="${flag} ${entry.count}">
        <span class="country-flag">${flag}</span>
        <span class="country-count">${entry.count}</span>
      </span>`;
    })
    .join('');
}

function initLikeButton() {
  if (!likesButtonEl || !likesCountEl) {
    return;
  }

  setLikeButtonState(readStoredLikeState());

  likesButtonEl.addEventListener('click', async () => {
    const previousLiked = isLikedByUser;
    const previousLikes = currentLikes;
    const nextLiked = !previousLiked;
    const likeDelta = nextLiked ? 1 : -1;
    const optimisticLikes = previousLikes === null
      ? (nextLiked ? 1 : 0)
      : Math.max(previousLikes + likeDelta, 0);

    setLikeButtonState(nextLiked);
    setLikesCount(optimisticLikes);
    likesButtonEl.disabled = true;

    try {
      const response = await fetch(LIKES_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: nextLiked ? 'like' : 'unlike' })
      });

      if (!response.ok) {
        throw new Error(`Like API failed: ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      const serverLikes = parseNumber(data.likes ?? data.count ?? data.total_likes);

      if (serverLikes !== null) {
        setLikesCount(serverLikes);
      }

      writeStoredLikeState(nextLiked);
    } catch {
      setLikeButtonState(previousLiked);

      if (previousLikes === null) {
        setLikesCount('--');
      } else {
        setLikesCount(previousLikes);
      }
    } finally {
      likesButtonEl.disabled = false;
    }
  });
}

function initVisitTracker() {
  const visitsEl = document.getElementById('total-visits');
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

      setLikesCount(data.likes ?? data.total_likes);
      renderCountryStats(data.visitors_by_country ?? data.countries ?? data.country_visits);

      const date = new Date(data.last_visit);
      lastVisitEl.textContent = Number.isNaN(date.getTime())
        ? '--'
        : formatVisitDate(date);
    })
    .catch(() => {
      visitsEl.textContent = '--';
      lastVisitEl.textContent = '--';
      setLikesCount('--');
      renderCountryStats(null);
    });
}

initLikeButton();
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
