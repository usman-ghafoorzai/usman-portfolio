export function clamp(value: number, min = 0, max = 1): number {
    return Math.min(Math.max(value, min), max);
}

export function easeOutCubic(value: number): number {
    const clampedValue = clamp(value);
    return 1 - Math.pow(1 - clampedValue, 3);
}
