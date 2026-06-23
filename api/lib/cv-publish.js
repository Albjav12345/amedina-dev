import fs from 'node:fs/promises';
import path from 'node:path';

const JSON_PATH = 'src/data/cv/published.json';
const PDF_PATH = 'public/Alberto_Medina_CV_2026.pdf';
const HTML_PATH = 'public/cv/Alberto_Medina_CV_2026.html';

async function githubRequest(endpoint, options = {}) {
    const token = process.env.CV_GITHUB_TOKEN;
    if (!token) throw new Error('CV_GITHUB_TOKEN_MISSING');

    const response = await fetch(`https://api.github.com${endpoint}`, {
        ...options,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`GITHUB_PUBLISH_FAILED_${response.status}: ${details.slice(0, 400)}`);
    }

    return response.status === 204 ? null : response.json();
}

async function publishThroughGitHub({ data, pdf, html }) {
    const repository = process.env.CV_GITHUB_REPOSITORY || 'Albjav/amedina-dev';
    const branch = process.env.CV_GITHUB_BRANCH || 'main';
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) throw new Error('CV_GITHUB_REPOSITORY_INVALID');

    const ref = await githubRequest(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
    const headSha = ref.object.sha;
    const headCommit = await githubRequest(`/repos/${owner}/${repo}/git/commits/${headSha}`);
    const files = [
        { path: JSON_PATH, content: `${JSON.stringify(data, null, 2)}\n`, encoding: 'utf-8' },
        { path: PDF_PATH, content: pdf.toString('base64'), encoding: 'base64' },
        { path: HTML_PATH, content: html, encoding: 'utf-8' },
    ];

    const blobs = await Promise.all(files.map(file => githubRequest(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: file.content, encoding: file.encoding }),
    })));

    const tree = await githubRequest(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
            base_tree: headCommit.tree.sha,
            tree: files.map((file, index) => ({
                path: file.path,
                mode: '100644',
                type: 'blob',
                sha: blobs[index].sha,
            })),
        }),
    });

    const commit = await githubRequest(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
            message: `chore(cv): publish revision ${data.publication.revision}`,
            tree: tree.sha,
            parents: [headSha],
        }),
    });

    await githubRequest(`/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    return {
        mode: 'github',
        commitSha: commit.sha,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
    };
}

async function publishLocally({ data, pdf, html }) {
    const rootDir = process.cwd();
    const targets = [
        [JSON_PATH, `${JSON.stringify(data, null, 2)}\n`],
        [PDF_PATH, pdf],
        [HTML_PATH, html],
    ];

    for (const [relativePath, content] of targets) {
        const targetPath = path.join(rootDir, relativePath);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content);
    }

    return { mode: 'local', files: targets.map(([filePath]) => filePath) };
}

export async function publishCvArtifacts(artifacts) {
    const shouldUseGitHub = process.env.CV_PUBLISH_MODE === 'github' || Boolean(process.env.VERCEL);
    return shouldUseGitHub ? publishThroughGitHub(artifacts) : publishLocally(artifacts);
}
