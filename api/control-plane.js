import {
    applySecurityHeaders,
    isAllowedOrigin,
} from './lib/security.js';
import {
    getControlPlaneSnapshot,
    recordServiceProbe,
} from './lib/control-plane.js';

async function probeGitHub() {
    const startedAt = Date.now();
    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AmedinaDev-Portfolio-ControlPlane',
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch('https://api.github.com/users/Albjav12345', { headers });
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
        throw new Error(`GitHub probe failed with status ${response.status}`);
    }

    const payload = await response.json();
    return {
        latencyMs,
        note: `GitHub profile sync ready for ${payload.login}. Public repos: ${payload.public_repos}.`,
    };
}

export default async function handler(req, res) {
    applySecurityHeaders(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req.headers.origin)) {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    try {
        try {
            const githubProbe = await probeGitHub();
            recordServiceProbe('github-sync', {
                status: 'operational',
                latencyMs: githubProbe.latencyMs,
                note: githubProbe.note,
            });
        } catch (error) {
            recordServiceProbe('github-sync', {
                status: process.env.GITHUB_TOKEN ? 'degraded' : 'degraded',
                note: error.message || 'GitHub probe failed.',
            });
        }

        const snapshot = getControlPlaneSnapshot();
        const latestTerminalRun = snapshot.runLogs.find((run) => run.channel === 'terminal') || null;
        const latestArchitectRun = snapshot.runLogs.find((run) => run.channel === 'architect') || null;
        const githubService = snapshot.services.find((service) => service.id === 'github-sync') || null;

        return res.status(200).json({
            ...snapshot,
            jobs: [
                {
                    id: 'terminal-job',
                    label: 'Last terminal orchestration',
                    status: latestTerminalRun?.status || 'idle',
                    at: latestTerminalRun?.completedAt || latestTerminalRun?.startedAt || null,
                    detail: latestTerminalRun?.decision || 'Awaiting the next terminal command.',
                },
                {
                    id: 'architect-job',
                    label: 'Last architect brief',
                    status: latestArchitectRun?.status || 'idle',
                    at: latestArchitectRun?.completedAt || latestArchitectRun?.startedAt || null,
                    detail: latestArchitectRun?.outputExcerpt || 'No architecture brief has been generated in this runtime yet.',
                },
                {
                    id: 'github-job',
                    label: 'GitHub sync probe',
                    status: githubService?.status || 'idle',
                    at: githubService?.lastEventAt || null,
                    detail: githubService?.note || 'Awaiting the next telemetry probe.',
                },
            ],
        });
    } catch (error) {
        return res.status(500).json({
            message: 'CONTROL_PLANE_REQUEST_FAILED',
            details: error.message || 'Unknown error',
        });
    }
}
