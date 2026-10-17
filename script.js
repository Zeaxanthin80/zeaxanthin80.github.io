/* ==========================================================================
   ZEAXANTHIN80 PORTFOLIO - SCRIPT
   - Theme Toggle (Light / Dark with localStorage persistence)
   - GitHub API Data Fetching (Repos & Language Stack)
   - Interactive SVG Eyes (Mouse tracking)
   - Parallax Scroll Effect
   ========================================================================== */

(function () {
  'use strict';

  const username = 'Zeaxanthin80';

  /* --------------------------------------------------------------------------
     1. Theme Switcher (Light / Dark)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return 'dark'; // Default to dark neo-retro theme
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Set initial theme
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  /* --------------------------------------------------------------------------
     2. GitHub Data Fetching & Rendering
     -------------------------------------------------------------------------- */
  const techStackNode = document.getElementById('tech-stack-grid');
  const projectsNode = document.getElementById('projects-grid');

  const byLanguageCount = (repos) =>
    repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});

  const topLanguages = (languageMap, limit = 8) =>
    Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

  const topRepos = (repos, limit = 6) =>
    repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, limit);

  function renderStack(languages) {
    if (!techStackNode) return;
    if (!languages || !languages.length) {
      techStackNode.innerHTML = '<div class="chip-skeleton">No language signal recorded.</div>';
      return;
    }

    techStackNode.innerHTML = languages
      .map(
        (lang) => `
        <div class="chip">
          <span class="chip-name">${lang.name}</span>
          <span class="chip-count">${lang.count} repo${lang.count > 1 ? 's' : ''}</span>
        </div>
      `
      )
      .join('');
  }

  function renderRepos(repos) {
    if (!projectsNode) return;
    if (!repos || !repos.length) {
      projectsNode.innerHTML = '<div class="card-skeleton">No repositories found.</div>';
      return;
    }

    projectsNode.innerHTML = repos
      .map(
        (repo) => `
        <article class="card">
          <div>
            <div class="card-header">
              <h3 class="card-title">${repo.name}</h3>
              ${repo.language ? `<span class="card-lang">${repo.language}</span>` : ''}
            </div>
            <p class="card-desc">${repo.description || 'No description provided for this repository.'}</p>
          </div>
          <a href="${repo.html_url}" class="card-link" target="_blank" rel="noreferrer">
            <span>Explore Code</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.08331 2.91669H11.0833V9.91669" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11.0833 2.91669L2.91663 11.0834" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </article>
      `
      )
      .join('');
  }

  async function fetchSummary() {
    // 1. Try Vercel Serverless Function if available
    try {
      const backendResponse = await fetch('/api/github-summary');
      if (backendResponse.ok) {
        return await backendResponse.json();
      }
    } catch (e) {
      // Fallback to client-side GitHub API call
    }

    // 2. Direct GitHub REST API Call
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!reposResponse.ok) {
      throw new Error('Failed to load repository data from GitHub API.');
    }

    const repos = await reposResponse.json();
    return {
      repos: topRepos(repos),
      languages: topLanguages(byLanguageCount(repos)),
    };
  }

  fetchSummary()
    .then((summary) => {
      renderStack(summary.languages || []);
      renderRepos(summary.repos || []);
    })
    .catch((error) => {
      console.error('Portfolio GitHub fetch error:', error);
      renderStack([]);
      if (projectsNode) {
        projectsNode.innerHTML =
          '<div class="card-skeleton">Unable to load live GitHub repository signal right now.</div>';
      }
    });

  /* --------------------------------------------------------------------------
     3. Interactive Robot Eye Pupil Motion
     -------------------------------------------------------------------------- */
  const leftPupil = document.querySelector('.left-pupil');
  const rightPupil = document.querySelector('.right-pupil');
  const robotEyesGroup = document.getElementById('robot-eyes');

  if (leftPupil && rightPupil && robotEyesGroup) {
    document.addEventListener('mousemove', (e) => {
      const rect = robotEyesGroup.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(4, Math.hypot(deltaX, deltaY) / 65);

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      leftPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      rightPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  /* --------------------------------------------------------------------------
     4. Parallax Scroll Effect on Robot Head
     -------------------------------------------------------------------------- */
  const headGroup = document.querySelector('.robot-head-group');
  if (headGroup) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 600) {
        const offset = scrollY * 0.08;
        headGroup.style.transform = `translateY(${offset}px)`;
      }
    }, { passive: true });
  }

  /* Dynamic Copyright Year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
