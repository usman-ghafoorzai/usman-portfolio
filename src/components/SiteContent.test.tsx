// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioContentProvider } from "../app/providers/PortfolioContentProvider";
import Hero from "./Hero/Hero";
import About from "./About/About";
import CurrentWork from "./CurrentWork/CurrentWork";

// Reveal supplied lines immediately; animation behavior has its own hook tests.
vi.mock("../hooks/useTerminalTypewriter", () => ({
    useTerminalTypewriter: ({ lines }: { lines: readonly string[] }) => lines,
}));

const content: ComponentProps<typeof PortfolioContentProvider>["content"] = {
    profile: {
        name: "Snapshot Developer", professionalTitle: "Engineer", email: "test@example.com",
        availabilityStatus: "Snapshot availability", links: { github: "", linkedin: "" },
    },
    siteContent: {
        hero: { roles: ["Snapshot role"] },
        about: {
            label: "Snapshot label", heading: "Snapshot heading", intro: "Snapshot intro",
            story: ["Snapshot story"], beyondCode: ["Snapshot beyond code"],
            currentFocus: ["Snapshot focus"], currentFocusSummary: "Snapshot focus summary",
            strengths: ['Clear "communication"'],
            education: [{ id: "education", institution: "Snapshot school", program: "Snapshot program", startYear: 2020, endYear: 2024 }],
        },
        currentWork: {
            primaryWork: "Snapshot work", buildLog: ["Snapshot build log"],
            clientWork: ["Snapshot client work"], focus: ["Snapshot work focus"],
        },
    },
    experiences: [{
        id: "experience", organization: "Snapshot organization", role: "Snapshot position",
        startDate: "2024", endDate: "2024", summary: "Snapshot experience summary",
        highlights: [], technologyIds: [],
    }],
    projects: [], technologies: [], capabilityAreas: [],
};

beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it("types the hero role supplied by the snapshot", () => {
    vi.useFakeTimers();
    const { container } = render(<PortfolioContentProvider content={content}><Hero /></PortfolioContentProvider>);
    for (let index = 0; index < "Snapshot role".length; index++) {
        act(() => { vi.advanceTimersByTime(80); });
    }
    expect(container.querySelector(".hero-rotating-word")?.textContent).toContain("Snapshot role");
});

it("renders About semantic content and formats education and experience locally", () => {
    render(<PortfolioContentProvider content={content}><About /></PortfolioContentProvider>);
    expect(screen.getByRole("heading", { name: "Snapshot heading" })).toBeTruthy();
    for (const text of ["Snapshot label", "Snapshot intro", "Snapshot story", "Snapshot beyond code", "Snapshot focus", "Snapshot experience summary"]) {
        expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('"Snapshot program, Snapshot school, 2020-2024"')).toBeTruthy();
    expect(screen.getByText('"Snapshot position, Snapshot organization, 2024"')).toBeTruthy();
    expect(screen.getByText(`"Clear \\"communication\\""`)).toBeTruthy();
    expect(screen.getByText('currentFocus: "Snapshot focus summary",')).toBeTruthy();
    expect(screen.getAllByText("> whoami").length).toBeGreaterThan(0);
    expect(screen.getByText("developer.js")).toBeTruthy();
});

it("renders CurrentWork semantic content with local terminal commands", () => {
    render(<PortfolioContentProvider content={content}><CurrentWork /></PortfolioContentProvider>);
    for (const text of ["Snapshot work", "Snapshot build log", "Snapshot client work", "Snapshot work focus", "Snapshot availability.", "> build_log", "current-work.sh"]) {
        expect(screen.getByText(text)).toBeTruthy();
    }
});
