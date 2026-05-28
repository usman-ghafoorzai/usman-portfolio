export function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}

export function easeOutCubic(value) {
    const clampedValue = clamp(value);
    return 1 - Math.pow(1 - clampedValue, 3);
}
