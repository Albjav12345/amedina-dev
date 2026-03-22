export function containWheelOnOverflow(event) {
    const element = event.currentTarget;

    if (!(element instanceof HTMLElement)) {
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
