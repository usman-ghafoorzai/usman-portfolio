import { clamp } from "../../utils/math";

export function getStackCardProgress(
    commandComplete: boolean,
    scanProgress: number,
    index: number,
    totalCards: number,
): number {
    if (!commandComplete) return 0;

    const start = index / totalCards;
    const end = (index + 1) / totalCards;
    const localProgress = (scanProgress - start) / (end - start);
    return clamp(localProgress);
}

export function getStackCardState(
    commandComplete: boolean,
    cardProgress: number,
): "pending" | "loading" | "ready" {
    if (!commandComplete || cardProgress <= 0) return "pending";
    if (cardProgress >= 1) return "ready";
    return "loading";
}

export function getTokenRevealProgress(groupProgress: number, itemIndex: number): number {
    const staggerOffset = itemIndex * 0.08;
    const localProgress = (groupProgress - staggerOffset) / (1 - Math.min(staggerOffset, 0.72));
    return clamp(localProgress);
}
