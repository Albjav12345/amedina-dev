import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
import { getSectionSceneFrame } from '../src/utils/scrollSceneMotion.js';

// Run against `npm run preview:lan`. No browser or test dependency is installed.
const base = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:5173';
const executablePath = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(candidate => fs.existsSync(candidate));
assert.ok(executablePath, 'Set CHROME_PATH to an installed Chrome/Chromium executable.');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath, headless: true });

try {
    for (const profile of [
        { width: 1543, height: 856 },
        { width: 390, height: 844 },
        { width: 1280, height: 700, fallback: true },
        { width: 1543, height: 856, reduced: true },
    ]) {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();
        await page.setViewport({ width: profile.width, height: profile.height });
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: profile.reduced ? 'reduce' : 'no-preference' }]);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        if (profile.fallback) {
            await page.evaluateOnNewDocument(() => {
                const original = CSS.supports.bind(CSS);
                CSS.supports = (property, value) => property === 'animation-timeline' ? false : original(property, value);
            });
        }
        await page.goto(base, { waitUntil: 'load' });
        await delay(1400);
        const scroll = async y => {
            await page.evaluate(target => {
                if (window.lenis) window.lenis.scrollTo(target, { immediate: true, force: true });
                else window.scrollTo({ top: target, behavior: 'instant' });
            }, y);
            await delay(140);
        };
        // Mount lazy content and settle geometry before sampling both directions.
        for (const id of ['about', 'projects', 'tech-stack', 'contact']) {
            await page.evaluate(id => window.scrollTo({ top: document.getElementById(`${id}-wrapper`).offsetTop, behavior: 'instant' }), id);
            await delay(450);
        }
        await scroll(0);
        await delay(500);
        const nativeCount = await page.$$eval('.section-backdrop--native', elements => elements.length);
        assert.equal(nativeCount, profile.fallback || profile.reduced ? 0 : 4, 'select supported native motion / fallback');
        const bounds = await page.evaluate(() => ['about', 'projects', 'tech-stack', 'contact'].map(id => {
            const rect = document.getElementById(`${id}-wrapper`).getBoundingClientRect();
            return { id, top: rect.top + scrollY, bottom: rect.bottom + scrollY };
        }));
        const positions = [0, .08, .26, .44, .62, .8].map(fraction => profile.height * fraction);
        for (const bound of bounds.slice(1)) {
            for (const fraction of [.8, .44, .08]) positions.push(bound.top - profile.height * fraction);
        }
        for (const position of [...positions, ...positions.slice().reverse()]) {
            await scroll(Math.max(0, position));
            const actual = await page.evaluate(() => ({
                y: scrollY, height: innerHeight,
                scenes: [...document.querySelectorAll('.section-backdrop')].map(element => {
                    const style = getComputedStyle(element);
                    const matrix = new DOMMatrix(style.transform);
                    return { opacity: Number(style.opacity), scale: matrix.a, y: matrix.f };
                }),
            }));
            actual.scenes.forEach((scene, index) => {
                const expected = getSectionSceneFrame({ ...bounds[index], scrollY: actual.y, height: actual.height, first: index === 0, reducedMotion: Boolean(profile.reduced) });
                const label = `${profile.width}px / y=${actual.y} / ${bounds[index].id}`;
                assert.ok(Math.abs(scene.opacity - expected.opacity) < .012, `opacity: ${label}`);
                if (!profile.reduced) {
                    const [, travel, scale] = expected.transform.match(/translate3d\(0, ([\d.]+)px, 0\) scale\(([\d.]+)\)/);
                    assert.ok(Math.abs(scene.y - Number(travel)) < .05, `parallax: ${label}`);
                    assert.ok(Math.abs(scene.scale - Number(scale)) < .0001, `scale: ${label}`);
                }
            });
        }
        if (nativeCount) {
            await scroll(profile.height * .3);
            await page.evaluate(() => {
                window.sceneWrites = 0;
                const observer = new MutationObserver(records => { window.sceneWrites += records.length; });
                observer.observe(document.querySelector('.section-backdrops'), { subtree: true, attributes: true, attributeFilter: ['style'] });
            });
            for (const fraction of [.35, .4, .45, .5]) await scroll(profile.height * fraction);
            assert.equal(await page.evaluate(() => window.sceneWrites), 0, 'native backgrounds perform no per-scroll JS style writes');
        }
        assert.deepEqual(errors, []);
        console.log(`PASS ${JSON.stringify(profile)}: fades, parallax, scale, reverse scroll and scene updates`);
        await context.close();
    }
} finally {
    await browser.close();
}
