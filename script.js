const username = 'Zeaxanthin80';

const techStackNode = document.getElementById('tech-stack');
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
  if (!languages.length) {
    techStackNode.innerHTML = '<div class="chip">No stack data available yet.</div>';
    return;
  }

  techStackNode.innerHTML = languages
    .map((lang) => `<div class="chip">${lang.name} · ${lang.count} repo${lang.count > 1 ? 's' : ''}</div>`)
    .join('');
}

function renderRepos(repos) {
  if (!repos.length) {
    projectsNode.innerHTML = '<article class="card"><h3>No repositories found.</h3></article>';
    return;
  }

  projectsNode.innerHTML = repos
    .map(
      (repo) => `
        <article class="card">
          <h3>${repo.name}</h3>
          <p>${repo.description || 'No description provided.'}</p>
          <a href="${repo.html_url}" target="_blank" rel="noreferrer">Open repository →</a>
        </article>
      `
    )
    .join('');
}

async function fetchSummary() {
  const backendResponse = await fetch('/api/github-summary');
  if (backendResponse.ok) {
    return backendResponse.json();
  }

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
    console.error(error);
    renderStack([]);
    projectsNode.innerHTML = '<article class="card"><h3>Unable to load repositories right now.</h3></article>';
  });
