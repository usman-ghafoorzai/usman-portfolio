// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TechStackCloud from "./TechStackCloud";

afterEach(cleanup);

const items = [{ label: "React", iconKey: "react", groupId: "frontend", stackId: "frontend", groupIndex: 0, itemIndex: 0, accentRgb: "255, 255, 255" }];

describe("technology selection", () => {
    it("prevents selection before the scan is ready", async () => {
        const user = userEvent.setup();
        const onStackSelect = vi.fn();
        render(<TechStackCloud items={items} commandComplete={true} scanProgress={0.5} selectionReady={false} onStackSelect={onStackSelect} />);
        const token = screen.getByRole<HTMLButtonElement>("button", { name: "View projects related to React" });
        expect(token.disabled).toBe(true);
        await user.click(token);
        expect(onStackSelect).not.toHaveBeenCalled();
    });

    it("selects the token's stack after the scan is ready", async () => {
        const user = userEvent.setup();
        const onStackSelect = vi.fn();
        render(<TechStackCloud items={items} commandComplete={true} scanProgress={1} selectionReady={true} onStackSelect={onStackSelect} />);
        const token = screen.getByRole<HTMLButtonElement>("button", { name: "View projects related to React" });
        expect(token.disabled).toBe(false);
        await user.click(token);
        expect(onStackSelect).toHaveBeenCalledExactlyOnceWith("frontend");
    });
});
