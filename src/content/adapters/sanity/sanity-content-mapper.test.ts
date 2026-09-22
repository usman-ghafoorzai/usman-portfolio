import { describe, expect, it } from "vitest";
import { CAPABILITY_AREA_IDS } from "../../../domain/capability";
import { mapSanityPortfolioSnapshot } from "./sanity-content-mapper";
import { parseSanityPortfolioSnapshot } from "./sanity-content-schema";

import { sanitySnapshotFixture as fixture } from "./sanity-snapshot.fixture";

// Mutate deliberately untrusted input without weakening the exported DTO type.
function setPath(input: unknown, path: string, value: unknown) {
    const parts = path.split(".");
    let target = input as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) target = target[part] as Record<string, unknown>;
    const key = parts[parts.length - 1];
    if (key === undefined) throw new Error("Expected a fixture field path");
    if (value === undefined) delete target[key];
    else target[key] = value;
}

describe("Sanity runtime boundary", () => {
    it("maps semantic content, preserves editorial order, and discards storage metadata", () => {
        const input = fixture();
        const before = structuredClone(input);
        const result = mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(input));
        expect(result.profile).toEqual({
            name: "Example", professionalTitle: "Developer", email: "example@example.com",
            availabilityStatus: "Available", links: input.profile.links,
        });
        expect(result.siteContent).toEqual({
            hero: input.siteContent.hero, currentWork: input.siteContent.currentWork,
            about: { ...input.siteContent.about, education: input.siteContent.about.education.map(entry => ({
                id: entry.stableId, institution: entry.institution, program: entry.program,
                startYear: entry.startYear, endYear: entry.endYear,
            })) },
        });
        expect(result.projects.map(project => project.id)).toEqual(["project-first", "project-a", "project-z"]);
        expect(result.projects[0]!).toEqual({
            id: "project-first", slug: "project-first-slug", title: "Project", label: "Label",
            summary: "Summary", year: 2025, status: "completed", featured: false,
            technologyIds: ["typescript", "react"],
            capabilityEvidence: [{ capabilityId: "workflow", priority: 2 }, { capabilityId: "systems", priority: 2 }],
            highlights: ["Second editorial item", "First editorial item"], links: input.projects[0]!.links,
        });
        expect(result.experiences.map(entry => entry.id)).toEqual(["job-old", "job-a", "job-b", "job-y", "job-z"]);
        expect(result.experiences[1]!).toEqual({
            id: "job-a", organization: "Organization", role: "Developer", summary: "Summary",
            startDate: "2020", endDate: "2023", highlights: ["Later", "Earlier"], technologyIds: ["typescript", "react"],
        });
        expect(result.experiences[4]!.endDate).toBeNull();
        expect(result.technologies).toEqual([{ id: "react", label: "react" }, { id: "typescript", label: "typescript" }]);
        expect(result.capabilityAreas).toEqual(CAPABILITY_AREA_IDS.map(id => ({ id, label: id, description: `${id} description` })));
        expect(JSON.stringify(result)).not.toMatch(/"(?:_id|_type|_key|displayOrder|stableId)":/);
        expect(input).toEqual(before);
    });

    it("preserves supplied optional fields and maps absent endYear to null", () => {
        const input = fixture();
        setPath(input, "projects.0.links.live", "https://example.com");
        setPath(input, "experiences.0.location", "Oslo");
        setPath(input, "experiences.0.endYear", undefined);
        const result = mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(input));
        expect(result.projects.find(entry => entry.id === "project-z")?.links.live).toBe("https://example.com");
        expect(result.projects[0]!.links).not.toHaveProperty("live");
        expect(result.experiences.find(entry => entry.id === "job-z")).toMatchObject({ location: "Oslo", endDate: null });
        expect(result.experiences[0]!).not.toHaveProperty("location");
    });

    it("accepts explicitly empty optional-content arrays without inventing content", () => {
        const input = fixture();
        input.projects[0]!.technologies = [];
        input.projects[0]!.capabilityEvidence = [];
        input.experiences[0]!.technologies = [];
        input.experiences[0]!.highlights = [];
        const result = mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(input));
        expect(result.projects.find(entry => entry.id === "project-z")).toMatchObject({ technologyIds: [], capabilityEvidence: [] });
        expect(result.experiences.find(entry => entry.id === "job-z")).toMatchObject({ technologyIds: [], highlights: [] });
    });

    it.each([
        ["whitespace text", "profile.name", "  "],
        ["non-HTTP URL", "projects.0.links.github", "ftp://example.com"],
        ["relative URL", "profile.links.github", "/example"],
        ["invalid email", "profile.email", "invalid"],
        ["invalid stable ID", "projects.0.stableId", "Bad_ID"],
        ["fractional year", "projects.0.year", 2020.5],
        ["out-of-range year", "projects.0.year", 2101],
        ["end before start", "experiences.0.endYear", 2019],
        ["education end before start", "siteContent.about.education.0.endYear", 2017],
        ["missing required empty-capable array", "siteContent.currentWork.clientWork", undefined],
        ["empty required array", "projects.0.highlights", []],
        ["blank array entry", "siteContent.hero.roles.0", "\t"],
        ["invalid status", "projects.0.status", "draft"],
        ["invalid priority", "projects.0.capabilityEvidence.0.priority", 4],
        ["wrong technology type", "projects.0.technologies.0._type", "project"],
        ["unresolved technology", "projects.0.technologies.0", null],
        ["unresolved capability", "projects.0.capabilityEvidence.0.capability", null],
        ["wrong capability type", "projects.0.capabilityEvidence.0.capability._type", "technology"],
        ["capability source mismatch", "capabilityAreas.0._id", "capability.frontend"],
        ["unknown capability", "capabilityAreas.0.stableId", "unknown"],
        ["draft singleton", "profile._id", "drafts.profile"],
        ["draft document", "projects.0._id", "drafts.project-z"],
        ["blank optional location", "experiences.0.location", " "],
    ])("rejects %s", (_label, path, value) => {
        const input = structuredClone(fixture());
        setPath(input, path as string, value);
        expect(() => parseSanityPortfolioSnapshot(input)).toThrow();
    });

    it.each<[string, (input: ReturnType<typeof fixture>) => void]>([
        ["duplicate project ID", input => { input.projects[1]!.stableId = input.projects[0]!.stableId; }],
        ["duplicate project slug", input => { input.projects[1]!.slug = input.projects[0]!.slug; }],
        ["duplicate experience ID", input => { input.experiences[1]!.stableId = input.experiences[0]!.stableId; }],
        ["duplicate technology ID", input => { input.technologies.push({ ...input.technologies[0]!, _id: "another-tech" }); }],
        ["duplicate education ID", input => { input.siteContent.about.education.push(input.siteContent.about.education[0]!); }],
        ["duplicate project technology", input => { input.projects[0]!.technologies = [...input.technologies, input.technologies[0]!]; }],
        ["duplicate experience technology", input => { input.experiences[0]!.technologies = [...input.technologies, input.technologies[0]!]; }],
        ["duplicate capability evidence", input => { input.projects[0]!.capabilityEvidence.push(input.projects[0]!.capabilityEvidence[0]!); }],
        ["missing referenced technology", input => { input.technologies = []; }],
        ["mismatched reference source", input => { input.projects[0]!.technologies = [{ ...input.technologies[0]!, _id: "other" }]; }],
        ["missing capability", input => { input.capabilityAreas.pop(); }],
        ["duplicate capability", input => { input.capabilityAreas.push(input.capabilityAreas[0]!); }],
    ])("rejects %s across the snapshot", (_label, mutate) => {
        const input = fixture();
        mutate(input);
        expect(() => parseSanityPortfolioSnapshot(input)).toThrow();
    });
});
