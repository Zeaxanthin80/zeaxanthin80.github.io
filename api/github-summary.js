const username = 'Zeaxanthin80';

module.exports = async (_, res) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Could not fetch repositories from GitHub',
      });
    }

    const repos = await response.json();

    const languageMap = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});

    const languages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const recentRepos = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        updated_at: repo.updated_at,
      }));

    return res.status(200).json({
      repos: recentRepos,
      languages,
    });
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
