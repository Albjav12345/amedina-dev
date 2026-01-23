/**
 * GITHUB_ANALYZER_NODE
 * Utility to fetch and process public GitHub data for Alberto's AI Terminal.
 */

export async function getGitHubActivity(username = 'Albjav1235') {
    const token = process.env.GITHUB_TOKEN;

    console.log('[GitHub] Starting fetch for user:', username);
    console.log('[GitHub] Token present:', !!token);

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AmedinaDev-Portfolio'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // Fetch Public Events (Commits, Pushes, etc.)
        console.log('[GitHub] Fetching events...');
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`, { headers });
        console.log('[GitHub] Events response status:', eventsRes.status);

        // Fetch Top Repositories
        console.log('[GitHub] Fetching repos...');
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, { headers });
        console.log('[GitHub] Repos response status:', reposRes.status);

        if (!eventsRes.ok || !reposRes.ok) {
            const eventsError = !eventsRes.ok ? await eventsRes.text() : null;
            const reposError = !reposRes.ok ? await reposRes.text() : null;
            console.error('[GitHub] API Error Details:', { eventsError, reposError });
            throw new Error(`GitHub API Error: ${eventsRes.status} / ${reposRes.status}`);
        }

        const events = await eventsRes.json();
        const repos = await reposRes.json();

        console.log('[GitHub] Successfully fetched', events.length, 'events and', repos.length, 'repos');

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

        console.log('[GitHub] Processed', recentCommits.length, 'recent commits');

        return {
            username,
            recentCommits,
            topRepos,
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error("[GitHub] Fetch Failure:", error.message, error.stack);
        throw error; // Re-throw para que chat.js lo capture
    }
}
