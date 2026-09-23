import { describe, expect, it } from "vitest";
import { mapSanityPortfolioSnapshot } from "./sanity-content-mapper";
import { parseSanityPortfolioSnapshot } from "./sanity-content-schema";
import { sanitySnapshotFixture } from "./sanity-snapshot.fixture";
import { assertPortfolioParity } from "../../testing/portfolio-parity";

function fixture() {
    const content = mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(sanitySnapshotFixture()));
    return {
        ...content,
        siteContent: {
            ...content.siteContent,
            currentWork: { ...content.siteContent.currentWork, clientWork: ["First", "Second"] },
        },
    };
}

// Deliberately corrupt copies of domain data, including values forbidden by its static type.
function atPath(value: unknown, path: string): Record<string, unknown> {
    let current = value as Record<string, unknown>;
    for (const key of path.split(".")) current = current[key] as Record<string, unknown>;
    return current;
}

describe("domain semantic parity", () => {
    it("normalizes only top-level technology order without mutating input", () => {
        const local = fixture();
        const sanity = { ...local, technologies: [...local.technologies].reverse() };
        const before = structuredClone(sanity);
        expect(() => assertPortfolioParity(local, sanity)).not.toThrow();
        expect(sanity).toEqual(before);
    });

    it.each([
        "projects", "experiences", "capabilityAreas", "siteContent.hero.roles",
        "siteContent.about.story", "siteContent.about.beyondCode", "siteContent.about.currentFocus",
        "siteContent.about.strengths", "siteContent.about.education", "siteContent.currentWork.buildLog",
        "siteContent.currentWork.clientWork", "siteContent.currentWork.focus", "projects.0.technologyIds",
        "projects.0.capabilityEvidence", "projects.0.highlights", "experiences.0.technologyIds",
        "experiences.0.highlights",
    ])("preserves strict array order at %s", path => {
        const local = fixture();
        const sanity = structuredClone(local);
        const array = atPath(sanity, path) as unknown as unknown[];
        expect(array.length).toBeGreaterThan(1);
        array.reverse();
        const displayPath = path.replace(/\.(\d+)/g, "[$1]");
        expect(() => assertPortfolioParity(local, sanity)).toThrow(`path: portfolio.${displayPath}[0]`);
    });

    it.each([
        ["profile", "name", "Changed"],
        ["profile.links", "github", "https://example.com/changed"],
        ["projects.0", "slug", "changed-slug"],
        ["projects.0.capabilityEvidence.0", "priority", 3],
        ["technologies.0", "label", "Changed technology"],
    ])("reports changed scalar or nested value at %s.%s", (path, key, value) => {
        const local = fixture();
        const sanity = structuredClone(local);
        atPath(sanity, path)[key] = value;
        const displayPath = `${path}.${key}`.replace(/\.(\d+)/g, "[$1]");
        expect(() => assertPortfolioParity(local, sanity)).toThrow(`path: portfolio.${displayPath}`);
        expect(() => assertPortfolioParity(local, sanity)).toThrow("local:");
        expect(() => assertPortfolioParity(local, sanity)).toThrow("sanity:");
    });

    it("reports missing fields", () => {
        const local = fixture();
        const sanity = structuredClone(local);
        delete atPath(sanity, "profile").name;
        expect(() => assertPortfolioParity(local, sanity)).toThrow("path: portfolio.profile.name\nreason: missing Sanity field");
    });

    it("reports unexpected fields and collection length changes", () => {
        const local = fixture();
        const sanity = structuredClone(local);
        atPath(sanity, "profile").unexpected = true;
        expect(() => assertPortfolioParity(local, sanity)).toThrow("unexpected Sanity field");
        expect(() => assertPortfolioParity(local, { ...local, projects: [] })).toThrow("path: portfolio.projects.length");
    });
});
