// iPadOS can identify itself as a Mac, including when a trackpad is connected.
// Do not classify desktop Macs or touch-enabled Windows PCs as iPads.
export function isAppleTouchDevice() {
    if (typeof navigator === 'undefined') return false;

    return /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
