// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTerminalTypewriter } from "./useTerminalTypewriter";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });
const advance = (milliseconds: number) => act(() => { vi.advanceTimersByTime(milliseconds); });
const timing = { typeSpeed: 10, lineDelay: 100 };

describe("sequential terminal typing", () => {
    it("stays inactive until activated, including the initial empty slice delay", () => {
        const lines = ["AB"];
        const { result, rerender } = renderHook(({ isActive }) => useTerminalTypewriter({ lines, isActive, ...timing }), { initialProps: { isActive: false } });
        advance(1000);
        expect(result.current).toEqual([""]);
        rerender({ isActive: true });
        advance(99);
        expect(result.current).toEqual([""]);
        advance(1);
        expect(result.current).toEqual([""]);
        advance(9);
        expect(result.current).toEqual([""]);
        advance(1);
        expect(result.current).toEqual(["A"]);
        advance(10);
        expect(result.current).toEqual(["AB"]);
    });

    it("preserves both inter-line delays and blank sequence entries", () => {
        const lines = ["A", "", "B"];
        const { result } = renderHook(() => useTerminalTypewriter({ lines, isActive: true, ...timing }));
        advance(100);
        advance(10);
        expect(result.current).toEqual(["A"]);
        advance(99);
        expect(result.current).toEqual(["A"]);
        advance(1);
        expect(result.current).toEqual(["A", ""]);
        advance(100);
        expect(result.current).toEqual(["A", ""]);
        advance(99);
        expect(result.current).toEqual(["A", ""]);
        advance(1);
        expect(result.current).toEqual(["A", "", ""]);
        advance(100);
        expect(result.current).toEqual(["A", "", ""]);
        advance(10);
        expect(result.current).toEqual(["A", "", "B"]);
    });

    it("keeps completed output stable as time continues", () => {
        const lines = ["A"];
        const { result } = renderHook(() => useTerminalTypewriter({ lines, isActive: true, ...timing }));
        advance(100);
        advance(10);
        advance(100);
        expect(result.current).toEqual(["A"]);
        advance(10000);
        expect(result.current).toEqual(["A"]);
    });
});
