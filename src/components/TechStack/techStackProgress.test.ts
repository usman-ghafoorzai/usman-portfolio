import { describe, expect, it } from "vitest";
import { getStackCardProgress, getStackCardState, getTokenRevealProgress } from "./techStackProgress";

describe("getStackCardProgress", () => {
    it("keeps cards hidden until the command completes", () => {
        expect(getStackCardProgress(false, 1, 0, 4)).toBe(0);
    });

    it("reveals the first card across its interval", () => {
        expect(getStackCardProgress(true, 0, 0, 4)).toBe(0);
        expect(getStackCardProgress(true, 0.125, 0, 4)).toBeCloseTo(0.5);
        expect(getStackCardProgress(true, 0.3, 0, 4)).toBe(1);
    });

    it("keeps a later card hidden before and at its start", () => {
        expect(getStackCardProgress(true, 0.4, 2, 4)).toBe(0);
        expect(getStackCardProgress(true, 0.5, 2, 4)).toBe(0);
    });

    it("reveals a later card during its own interval", () => {
        expect(getStackCardProgress(true, 0.625, 2, 4)).toBeCloseTo(0.5);
    });

    it("clamps progress at the completed end", () => {
        expect(getStackCardProgress(true, 0.75, 2, 4)).toBe(1);
        expect(getStackCardProgress(true, 1.2, 3, 4)).toBe(1);
    });

    it("scales intervals to the supplied card count", () => {
        expect(getStackCardProgress(true, 0.5, 1, 3)).toBeCloseTo(0.5);
        expect(getStackCardProgress(true, 0.5, 0, 1)).toBeCloseTo(0.5);
    });
});

describe("getStackCardState", () => {
    it.each([
        [false, 1, "pending"],
        [true, -0.1, "pending"],
        [true, 0, "pending"],
        [true, 0.5, "loading"],
        [true, 1, "ready"],
        [true, 1.1, "ready"],
    ] as const)("classifies commandComplete=%s, progress=%s as %s", (complete, progress, state) => {
        expect(getStackCardState(complete, progress)).toBe(state);
    });
});

describe("getTokenRevealProgress", () => {
    it("applies no stagger to the first token", () => {
        expect(getTokenRevealProgress(0, 0)).toBe(0);
        expect(getTokenRevealProgress(0.5, 0)).toBeCloseTo(0.5);
    });

    it("keeps later tokens hidden until their threshold", () => {
        expect(getTokenRevealProgress(0.1, 2)).toBe(0);
        expect(getTokenRevealProgress(0.16, 2)).toBe(0);
    });

    it("reveals later tokens after their threshold", () => {
        expect(getTokenRevealProgress(0.58, 2)).toBeCloseTo(0.5);
    });

    it("clamps completed token reveal progress", () => {
        expect(getTokenRevealProgress(1, 2)).toBe(1);
        expect(getTokenRevealProgress(1.2, 2)).toBe(1);
    });

    it("preserves the capped stagger denominator for high token indices", () => {
        expect(getTokenRevealProgress(0.94, 10)).toBeCloseTo(0.5);
    });
});
