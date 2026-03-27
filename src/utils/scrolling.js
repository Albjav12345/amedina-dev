export function containWheelOnOverflow(event) {
    const element = event.currentTarget;
    const target = event.target;

    if (!(element instanceof HTMLElement)) {
        return;
    }

    if (target instanceof Element && target.closest('[data-wheel-axis="x"]')) {
        return;
    }

    const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;

    if (!hasVerticalOverflow) {
        return;
    }

    const deltaY = event.deltaY;
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    const isScrollingUp = deltaY < 0;
    const isScrollingDown = deltaY > 0;
    const atTop = element.scrollTop <= 0;
    const atBottom = element.scrollTop >= maxScrollTop - 1;
    const canScrollWithinElement = (isScrollingUp && !atTop) || (isScrollingDown && !atBottom) || deltaY === 0;

    if (canScrollWithinElement) {
        event.stopPropagation();
    }
}

export function translateWheelToHorizontalScroll(event) {
    const element = event.currentTarget;

    if (!(element instanceof HTMLElement)) {
        return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    if (maxScrollLeft <= 1) {
        return;
    }

    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (!dominantDelta) {
        return;
    }

    const canScrollLeft = dominantDelta < 0 && element.scrollLeft > 0;
    const canScrollRight = dominantDelta > 0 && element.scrollLeft < maxScrollLeft - 1;

    if (canScrollLeft || canScrollRight) {
        event.preventDefault();
        event.stopPropagation();
        element.scrollLeft = Math.max(0, Math.min(maxScrollLeft, element.scrollLeft + dominantDelta));
    }
}
