import { describe, expect, it } from "vitest";
import { profile } from "../../../../data/profile";
import { siteContent } from "../../../../data/siteContent";
import { projects } from "../../../../data/projects";
import { experiences } from "../../../../data/experiences";
import { technologies } from "../../../../data/technologies";
import { capabilityAreas } from "../../../../data/capabilities";
import { CAPABILITY_AREA_IDS } from "../../../../domain/capability";
import { mapSanityPortfolioSnapshot, type MappedSanityPortfolio } from "../sanity-content-mapper";
import { parseSanityPortfolioSnapshot } from "../sanity-content-schema";
import { buildSanityMigrationDocuments, projectSanityMigrationSnapshot, renderSanityMigrationNdjson } from "./sanity-migration";

const source: MappedSanityPortfolio = { profile, siteContent, projects, experiences, technologies, capabilityAreas };

describe("offline portfolio migration", () => {
    it("preserves actual local content through stored documents, validation and mapping", () => {
        const before = structuredClone(source);
        const mapped = mapSanityPortfolioSnapshot(parseSanityPortfolioSnapshot(
            projectSanityMigrationSnapshot(buildSanityMigrationDocuments(source)),
        ));
        // Only top-level Technology ordering differs intentionally under the approved CMS contract.
        expect({ ...mapped, technologies: undefined }).toEqual({ ...source, technologies: undefined });
        const orderedTechnologies = [...technologies].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
        expect(mapped.technologies).toEqual(orderedTechnologies);
        expect(mapped.technologies).not.toEqual(technologies);
        expect(source).toEqual(before);
    });

    it("builds byte-identical NDJSON with one document per line", () => {
        const first = buildSanityMigrationDocuments(source);
        const second = buildSanityMigrationDocuments(source);
        expect(first).toEqual(second);
        const ndjson = renderSanityMigrationNdjson(first);
        expect(ndjson).toBe(renderSanityMigrationNdjson(second));
        expect(ndjson.endsWith("\n")).toBe(true);
        expect(ndjson.trimEnd().split("\n").map(line => JSON.parse(line))).toEqual(first);
        expect(ndjson).not.toContain("undefined");
    });

    it("uses deterministic published IDs and original project indexes independently of slugs", () => {
        const input = { ...source, projects: source.projects.map((entry, index) => index === 0 ? { ...entry, slug: "different-routing-slug" } : entry) };
        const documents = buildSanityMigrationDocuments(input);
        expect(new Set(documents.map(doc => doc._id)).size).toBe(documents.length);
        expect(documents.some(doc => doc._id.startsWith("drafts."))).toBe(false);
        expect(documents.filter(doc => doc._type === "profile").map(doc => doc._id)).toEqual(["profile"]);
        expect(documents.filter(doc => doc._type === "siteContent").map(doc => doc._id)).toEqual(["siteContent"]);
        expect(documents.filter(doc => doc._type === "capabilityArea").map(doc => doc._id)).toEqual(CAPABILITY_AREA_IDS.map(id => `capability-${id}`));
        for (const doc of documents.filter(doc => doc._type === "capabilityArea")) {
            expect(doc._id).not.toContain(".");
        }
        for (const doc of documents) {
            if (doc._type === "technology" || doc._type === "experience" || doc._type === "project") {
                expect(doc._id).toBe(`${doc._type}-${doc.stableId}`);
            }
        }
        documents.filter(doc => doc._type === "project").forEach((doc, index) => {
            expect(doc.displayOrder).toBe(index);
            expect(doc.stableId).toBe(projects[index]!.id);
            expect(doc.slug).toEqual({ _type: "slug", current: input.projects[index]!.slug });
        });
    });

    it("preserves ordered strong references and unique semantic array keys", () => {
        const documents = buildSanityMigrationDocuments(source);
        const byId = new Map(documents.map(doc => [doc._id, doc]));
        for (const doc of documents) {
            if (doc._type === "project" || doc._type === "experience") {
                const original = (doc._type === "project" ? source.projects : source.experiences).find(entry => entry.id === doc.stableId)!;
                expect(doc.technologies).toEqual(original.technologyIds.map(id => ({ _key: id, _type: "reference", _ref: `technology-${id}` })));
                expect(new Set(doc.technologies.map(ref => ref._key)).size).toBe(doc.technologies.length);
                for (const ref of doc.technologies) {
                    expect(byId.get(ref._ref)?._type).toBe("technology");
                    expect(ref).not.toHaveProperty("_weak");
                }
            }
            if (doc._type === "project") {
                const original = projects.find(entry => entry.id === doc.stableId)!;
                expect(doc.capabilityEvidence).toEqual(original.capabilityEvidence.map(entry => ({
                    _key: entry.capabilityId, _type: "evidence", priority: entry.priority,
                    capability: { _type: "reference", _ref: `capability-${entry.capabilityId}` },
                })));
                expect(new Set(doc.capabilityEvidence.map(entry => entry._key)).size).toBe(doc.capabilityEvidence.length);
                for (const entry of doc.capabilityEvidence) expect(byId.get(entry.capability._ref)?._type).toBe("capabilityArea");
            }
            if (doc._type === "siteContent") {
                expect(doc.about.education.map(entry => entry._key)).toEqual(siteContent.about.education.map(entry => entry.id));
                expect(new Set(doc.about.education.map(entry => entry._key)).size).toBe(doc.about.education.length);
                expect(doc.about.education.every(entry => entry._type === "educationEntry")).toBe(true);
            }
        }
    });

    it("converts year precision and omits absent optional values", () => {
        const input = { ...source, experiences: source.experiences.map(entry => ({ ...entry, endDate: null })) };
        const documents = buildSanityMigrationDocuments(input);
        for (const doc of documents) {
            if (doc._type === "experience") {
                expect(doc.startYear).toBe(Number(experiences.find(entry => entry.id === doc.stableId)!.startDate));
                expect(doc).not.toHaveProperty("endYear");
                expect(doc).not.toHaveProperty("location");
            }
            if (doc._type === "project") expect(doc.links).not.toHaveProperty("live");
        }
        expect(() => renderSanityMigrationNdjson(documents)).not.toThrow();
    });

    it.each(["2020-01", "2020-01-01", " 2020", "20", "2020T00:00:00Z"])("rejects imprecise/invalid date %s", startDate => {
        expect(() => buildSanityMigrationDocuments({ ...source, experiences: [{ ...experiences[0]!, startDate }] })).toThrow(/four-digit/);
    });

    it.each<[string, (input: MappedSanityPortfolio) => MappedSanityPortfolio]>([
        ["duplicate projects", input => ({ ...input, projects: [...input.projects, input.projects[0]!] })],
        ["duplicate slugs", input => ({ ...input, projects: input.projects.map(entry => ({ ...entry, slug: "same" })) })],
        ["missing capability", input => ({ ...input, capabilityAreas: input.capabilityAreas.slice(1) })],
        ["duplicate capability", input => ({ ...input, capabilityAreas: [...input.capabilityAreas, input.capabilityAreas[0]!] })],
        ["unresolved technology", input => ({ ...input, technologies: [] })],
        ["duplicate technology refs", input => ({ ...input, projects: [{ ...input.projects[0]!, technologyIds: ["react", "react"] }] })],
        ["duplicate evidence", input => ({ ...input, projects: [{ ...input.projects[0]!, capabilityEvidence: [input.projects[0]!.capabilityEvidence[0]!, input.projects[0]!.capabilityEvidence[0]!] }] })],
        ["end before start", input => ({ ...input, experiences: [{ ...experiences[0]!, endDate: "1900" }] })],
        ["invalid required text", input => ({ ...input, profile: { ...input.profile, name: " " } })],
    ])("preflights %s before returning documents", (_label, change) => {
        expect(() => buildSanityMigrationDocuments(change(source))).toThrow();
    });

    it("rechecks storage before serialization, including weak references and duplicate keys", () => {
        const documents = buildSanityMigrationDocuments(source);
        const project = documents.find(doc => doc._type === "project")!;
        Object.assign(project.technologies[0]!, { _weak: true });
        expect(() => renderSanityMigrationNdjson(documents)).toThrow(/weak/);
        const other = buildSanityMigrationDocuments(source);
        const otherProject = other.find(doc => doc._type === "project")!;
        otherProject.technologies[1]!._key = otherProject.technologies[0]!._key;
        expect(() => renderSanityMigrationNdjson(other)).toThrow(/_key/);
    });
});
