/// <reference types="node" />
// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioContentProvider } from "../../app/providers/PortfolioContentProvider";
import Projects from "./Projects";
import { readFileSync } from "node:fs";
const styles = readFileSync("src/components/Projects/Projects.css", "utf8");

const content: ComponentProps<typeof PortfolioContentProvider>["content"] = {
    profile: { name: "Test Developer", professionalTitle: "Engineer", email: "test@example.com", availabilityStatus: "Available", links: { github: "https://example.com", linkedin: "https://example.com" } },
    siteContent: {
        hero: { roles: ["Test role"] },
        about: {
            label: "About", heading: "Test heading", intro: "Test intro",
            story: [], beyondCode: [], currentFocus: [], currentFocusSummary: "Focus",
            strengths: [], education: [],
        },
        currentWork: { primaryWork: "Test work", buildLog: [], clientWork: [], focus: [] },
    },
    technologies: [{ id: "test-tech", label: "Snapshot Technology" }],
    capabilityAreas: [],
    experiences: [],
    projects: [
        { id: "ui", slug: "ui", title: "Snapshot UI", label: "Interface", summary: "A supplied frontend project.", year: 2026, status: "completed", featured: true, technologyIds: ["test-tech"], capabilityEvidence: [{ capabilityId: "frontend", priority: 1 }], highlights: [], links: { github: "https://example.com/ui" } },
        { id: "api", slug: "api", title: "Snapshot API", label: "Service", summary: "A supplied backend project.", year: 2026, status: "completed", featured: false, technologyIds: [], capabilityEvidence: [{ capabilityId: "backend", priority: 1 }], highlights: [], links: { github: "https://example.com/api" } },
    ],
};

beforeEach(() => {
    // jsdom has no viewport observation; motion remains inactive for these content tests.
    vi.stubGlobal("IntersectionObserver", class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function renderProjects(activeStack = "all", onStackChange = vi.fn()) {
    return render(<PortfolioContentProvider content={content}>
        <style>{styles}</style>
        <Projects activeStack={activeStack} onStackChange={onStackChange} />
    </PortfolioContentProvider>);
}

describe("project content boundary", () => {
    it("renders the supplied snapshot and technology labels", () => {
        renderProjects();
        expect(screen.getByRole("link", { name: "Open Snapshot UI on GitHub" }).getAttribute("href")).toBe("https://example.com/ui");
        expect(screen.getByRole("link", { name: "Open Snapshot API on GitHub" })).toBeTruthy();
        expect(screen.getByText("A supplied frontend project.")).toBeTruthy();
        expect(screen.getByText("Snapshot Technology")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Show all" })).toBeNull();
    });

    it("shows matching evidence and lets the user request all projects", async () => {
        const user = userEvent.setup();
        const onStackChange = vi.fn();
        renderProjects("frontend", onStackChange);
        expect(screen.getByText("Frontend")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Open Snapshot UI on GitHub" })).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Open Snapshot API on GitHub" })).toBeNull();
        await user.click(screen.getByRole("button", { name: "Show all" }));
        expect(onStackChange).toHaveBeenCalledExactlyOnceWith("all");
    });
});
