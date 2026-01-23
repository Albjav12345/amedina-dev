/**
 * GITHUB_ANALYZER_NODE
 * Utility to fetch and process public GitHub data for Alberto's AI Terminal.
 */

export async function getGitHubActivity(username = 'Albjav1235') {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        ...(token && { 'Authorization': `token ${token}` })
    };

    try {
        // Fetch Public Events (Commits, Pushes, etc.)
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`, { headers });

        // Fetch Top Repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, { headers });

        if (!eventsRes.ok || !reposRes.ok) {
            throw new Error(`GitHub API Error: ${eventsRes.status} / ${reposRes.status}`);
        }

        const events = await eventsRes.json();
        const repos = await reposRes.json();

        // Process latest 5 commits/push events
        const recentCommits = events
            .filter(e => e.type === 'PushEvent')
            .slice(0, 5)
            .map(e => ({
                repo: e.repo.name.replace(`${username}/`, ''),
                message: e.payload.commits?.[0]?.message || 'Routine update',
                date: new Date(e.created_at).toLocaleDateString()
            }));

        // Process top repos summary
        const topRepos = repos.map(r => ({
            name: r.name,
            lang: r.language,
            stars: r.stargazers_count,
            description: r.description
        }));

        return {
            username,
            recentCommits,
            topRepos,
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error("GitHub Fetch Failure:", error);
        return null;
    }
}
