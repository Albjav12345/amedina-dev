export const SCENE_FADE_START = 0.08;
export const SCENE_FADE_DISTANCE = 0.72;
export const SCENE_TRAVEL = 0.08;
export const SCENE_SCALE_CHANGE = 0.025;

const clamp = value => Math.min(Math.max(value, 0), 1);

export function getSceneExitProgress(scrollY, height) {
    return clamp((scrollY - height * SCENE_FADE_START) / (height * SCENE_FADE_DISTANCE));
}

export function getSceneExitFrame(progress, height) {
    const bounded = clamp(progress);
    return {
        opacity: 1 - bounded,
        transform: `translate3d(0, ${bounded * height * SCENE_TRAVEL}px, 0) scale(${1 - bounded * SCENE_SCALE_CHANGE})`,
    };
}

export function getSectionSceneFrame({ scrollY, height, top, bottom, first, reducedMotion }) {
    if (reducedMotion) {
        const entered = first ? scrollY > height * 0.42 : top - scrollY <= height * 0.44;
        return { opacity: Number(entered && bottom - scrollY > height * 0.44), transform: 'none' };
    }

    // Adjacent scenes use complementary fade ranges at their shared boundary.
    const incoming = first ? getSceneExitProgress(scrollY, height)
        : clamp((height * 0.8 - (top - scrollY)) / (height * SCENE_FADE_DISTANCE));
    const outgoing = clamp((height * 0.8 - (bottom - scrollY)) / (height * SCENE_FADE_DISTANCE));
    const travel = clamp((scrollY - top) / Math.max(bottom - top, 1));
    return {
        opacity: incoming * getSceneExitFrame(outgoing, height).opacity,
        transform: getSceneExitFrame(travel, height).transform,
    };
}
