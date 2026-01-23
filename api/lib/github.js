/**
 * GITHUB_ANALYZER_NODE
 * Utility to fetch and process public GitHub data for Alberto's AI Terminal.
 */

export async function getGitHubActivity(username = 'Albjav12345') {
    const token = process.env.GITHUB_TOKEN;

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AmedinaDev-Portfolio'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log(`[GitHub] Fetching full profile for ${username}...`);

        // Parallel fetches for efficiency
        const [userRes, eventsRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/events/public`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers })
        ]);

        if (!userRes.ok || !eventsRes.ok || !reposRes.ok) {
            throw new Error(`GitHub API Error: ${userRes.status} / ${eventsRes.status} / ${reposRes.status}`);
        }

        const [user, events, repos] = await Promise.all([
            userRes.json(),
            eventsRes.json(),
            reposRes.json()
        ]);

        // Process latest commits accurately
        const recentCommits = events
            .filter(e => e.type === 'PushEvent' && e.payload.commits)
            .flatMap(e => e.payload.commits.map(c => ({
                repo: e.repo.name.replace(`${username}/`, ''),
                message: c.message,
                date: new Date(e.created_at).toLocaleDateString()
            })))
            .slice(0, 5); // Keep top 5 latest commits across all repos

        // Process top repos meticulously
        const topRepos = repos.map(r => ({
            name: r.name,
            lang: r.language,
            stars: r.stargazers_count,
            description: r.description,
            url: r.html_url
        }));

        console.log(`[GitHub] Success. Public Repos: ${user.public_repos}, Followers: ${user.followers}`);

        return {
            username: user.login,
            name: user.name,
            bio: user.bio,
            stats: {
                totalPublicRepos: user.public_repos,
                followers: user.followers,
                following: user.following,
                publicGists: user.public_gists
            },
            recentCommits,
            topRepos,
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error("[GitHub] Fetch Failure:", error.message);
        throw error;
    }
}
