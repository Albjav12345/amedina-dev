import { DEFAULT_SECTION_ID, getSectionIdFromPathname } from './sectionRouting';
import { subscribeScrollRuntime } from './scrollRuntime';

const ENTRY_MS = 900;
const MEDIA_TIMEOUT_MS = 900;
const clamp = (value) => Math.min(Math.max(value, 0), 1);

async function decodePreview(image) {
    if (!image.complete) {
        await new Promise((resolve) => {
            const finish = () => {
                image.removeEventListener('load', finish);
                image.removeEventListener('error', finish);
                resolve();
            };
            image.addEventListener('load', finish);
            image.addEventListener('error', finish);
        });
    }
    await image.decode?.().catch(() => undefined);
}

// Keep Safari's native scrolling independent of React and of inherited custom
// property updates across the whole card tree. Other platforms keep their path.
export function createAppleHeroMotion({ wall, section, isFrozen, onActivityChange }) {
    const track = wall.querySelector('.hero-project-wall__track');
    const backdrop = section.querySelector('.hero-reel-section__backdrop');
    const glow = section.querySelector('.hero-reel-section__glow');
    const noise = section.querySelector('.hero-reel-section__noise');
    const layers = [wall, backdrop, glow, noise].filter(Boolean);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsNativeScroll = window.CSS?.supports('animation-timeline', 'scroll(root block)')
        && window.CSS?.supports('animation-range', '0px 100px');

    let disposed = false;
    let ready = false;
    let entered = false;
    let entryComplete = false;
    let snapshot = null;
    let viewportWidth = 0;
    let viewportHeight = 1;
    let lastOpacity = null;
    let lastActive = null;
    let entryFrame = null;
    let entryTimer = null;
    let mediaTimer = null;

    function setOpacity(opacity) {
        if (opacity === lastOpacity) return;
        lastOpacity = opacity;
        // Direct opacity writes don't invalidate styles on 72/108 descendants.
        wall.style.opacity = String(opacity);
        backdrop.style.opacity = String(opacity);
        glow.style.opacity = String(opacity);
        noise.style.opacity = String(opacity * 0.18);
    }

    function syncScrollMode() {
        const animate = entryComplete && !motionQuery.matches;
        section.classList.toggle('hero-reel-section--native-scroll', animate && supportsNativeScroll);
        section.classList.toggle('hero-reel-section--scroll-fallback', animate && !supportsNativeScroll);
    }

    function finishEntry() {
        entryTimer = null;
        entryComplete = true;
        wall.classList.remove('hero-project-wall--visuals-entering');
        section.classList.remove('hero-reel-section--visuals-entering');
        syncScrollMode();
        update();
    }

    function enableEntry() {
        if (entered || !ready || !snapshot) return;
        const isHome = getSectionIdFromPathname(window.location.pathname) === DEFAULT_SECTION_ID;
        if (!isHome && snapshot.scrollY < viewportHeight * 0.8) return;

        entered = true;
        // Do not toggle visibility again at the fade boundary. WebKit otherwise
        // has to rebuild the wall's backing layers on the first returning frame.
        wall.style.visibility = 'visible';
        if (!isHome || motionQuery.matches) {
            // A restored deep route is already beyond the fade range. Arm the
            // transparent scene there, before the user starts scrolling back.
            entryComplete = true;
            syncScrollMode();
        } else {
            wall.classList.add('hero-project-wall--visuals-entering');
            section.classList.add('hero-reel-section--visuals-entering');
            entryTimer = window.setTimeout(finishEntry, ENTRY_MS + 80);
        }
    }

    function update(nextSnapshot = snapshot) {
        if (disposed || !nextSnapshot) return;
        snapshot = nextSnapshot;
        const { scrollY, width, height } = snapshot;

        // Safari's expanding/collapsing toolbar changes innerHeight mid-swipe.
        // Keep one scroll range until an actual width/orientation change.
        if (viewportWidth !== width) {
            viewportWidth = width;
            viewportHeight = Math.max(height, 1);
            section.style.setProperty('--hero-scroll-start', `${viewportHeight * 0.08}px`);
            section.style.setProperty('--hero-scroll-end', `${viewportHeight * 0.8}px`);
            section.style.setProperty('--hero-scroll-offset', `${viewportHeight * 0.08}px`);
        }

        enableEntry();
        const reduced = motionQuery.matches;
        const progress = reduced
            ? Number(scrollY > viewportHeight * 0.42)
            : clamp((scrollY - viewportHeight * 0.08) / (viewportHeight * 0.72));
        const nativeScroll = supportsNativeScroll && entryComplete && !reduced;

        if (!nativeScroll) {
            setOpacity(entered ? 1 - progress : 0);
            const transform = reduced
                ? 'none'
                : `translate3d(0, ${progress * viewportHeight * 0.08}px, 0) scale(${1 - progress * 0.025})`;
            if (wall.style.transform !== transform) wall.style.transform = transform;
        }

        const active = entered && progress < 1 && !reduced && !document.hidden && !isFrozen();
        if (active !== lastActive) {
            lastActive = active;
            track.style.animationPlayState = active ? 'running' : 'paused';
            onActivityChange(active);
        }
    }

    function refreshMotionPreference() {
        lastOpacity = null;
        syncScrollMode();
        update();
    }

    setOpacity(0);
    wall.style.visibility = 'hidden';
    track.style.animationPlayState = 'paused';
    const unsubscribe = subscribeScrollRuntime(update);
    document.addEventListener('visibilitychange', refreshMotionPreference);
    window.addEventListener('pageshow', refreshMotionPreference);
    motionQuery.addEventListener('change', refreshMotionPreference);

    // All copies use the same handful of small WebP sources. Decode each source
    // once, before entry; offscreen copies must not depend on late lazy loading.
    const previews = [...new Map(Array.from(wall.querySelectorAll('img')).map((image) => (
        [image.currentSrc || image.src, image]
    ))).values()];
    const timeout = new Promise((resolve) => { mediaTimer = window.setTimeout(resolve, MEDIA_TIMEOUT_MS); });
    Promise.race([Promise.allSettled(previews.map(decodePreview)), timeout]).then(() => {
        if (disposed) return;
        window.clearTimeout(mediaTimer);
        mediaTimer = null;
        ready = true;
        enableEntry();
        entryFrame = window.requestAnimationFrame(() => {
            entryFrame = null;
            update();
        });
    });

    return {
        refresh: () => update(),
        destroy() {
            disposed = true;
            unsubscribe();
            window.cancelAnimationFrame(entryFrame);
            window.clearTimeout(entryTimer);
            window.clearTimeout(mediaTimer);
            document.removeEventListener('visibilitychange', refreshMotionPreference);
            window.removeEventListener('pageshow', refreshMotionPreference);
            motionQuery.removeEventListener('change', refreshMotionPreference);
            section.classList.remove('hero-reel-section--native-scroll', 'hero-reel-section--scroll-fallback', 'hero-reel-section--visuals-entering');
            wall.classList.remove('hero-project-wall--visuals-entering');
            ['--hero-scroll-start', '--hero-scroll-end', '--hero-scroll-offset'].forEach((property) => section.style.removeProperty(property));
            layers.forEach((layer) => layer.style.removeProperty('opacity'));
        },
    };
}
