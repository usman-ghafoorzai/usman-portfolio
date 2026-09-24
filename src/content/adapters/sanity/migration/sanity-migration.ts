import { CAPABILITY_AREA_IDS } from "../../../../domain/capability";
import type { MappedSanityPortfolio } from "../sanity-content-mapper";
import { parseSanityPortfolioSnapshot } from "../sanity-content-schema";

const compareIds = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const reference = (id: string) => ({ _type: "reference" as const, _ref: id });
const technologyRefs = (ids: readonly string[]) => ids.map(id => ({ _key: id, ...reference(`technology-${id}`) }));

function parseYear(value: string): number {
    if (typeof value !== "string" || !/^\d{4}$/.test(value)) throw new Error(`Migration requires an exact four-digit year: ${value}`);
    return Number(value);
}

function createDocuments(source: MappedSanityPortfolio) {
    const { profile, siteContent } = source;
    const { about, currentWork } = siteContent;
    return [
        {
            _id: "profile", _type: "profile" as const,
            name: profile.name, professionalTitle: profile.professionalTitle,
            email: profile.email, availabilityStatus: profile.availabilityStatus,
            links: { github: profile.links.github, linkedin: profile.links.linkedin },
        },
        {
            _id: "siteContent", _type: "siteContent" as const,
            hero: { roles: [...siteContent.hero.roles] },
            about: {
                label: about.label, heading: about.heading, intro: about.intro,
                story: [...about.story], beyondCode: [...about.beyondCode], currentFocus: [...about.currentFocus],
                currentFocusSummary: about.currentFocusSummary, strengths: [...about.strengths],
                education: about.education.map(entry => ({
                    _type: "educationEntry" as const, _key: entry.id, stableId: entry.id,
                    institution: entry.institution, program: entry.program, startYear: entry.startYear, endYear: entry.endYear,
                })),
            },
            currentWork: {
                primaryWork: currentWork.primaryWork, buildLog: [...currentWork.buildLog],
                clientWork: [...currentWork.clientWork], focus: [...currentWork.focus],
            },
        },
        ...[...source.technologies].sort((a, b) => compareIds(a.id, b.id)).map(entry => ({
            _id: `technology-${entry.id}`, _type: "technology" as const, stableId: entry.id, label: entry.label,
        })),
        // Keep every input item until validation: never hide extra or duplicate capabilities.
        ...[...source.capabilityAreas].sort((a, b) => CAPABILITY_AREA_IDS.indexOf(a.id) - CAPABILITY_AREA_IDS.indexOf(b.id)).map(entry => ({
            _id: `capability-${entry.id}`, _type: "capabilityArea" as const,
            stableId: entry.id, label: entry.label, description: entry.description,
        })),
        ...source.projects.map((entry, displayOrder) => ({
            _id: `project-${entry.id}`, _type: "project" as const, stableId: entry.id,
            slug: { _type: "slug" as const, current: entry.slug },
            title: entry.title, label: entry.label, summary: entry.summary, year: entry.year,
            status: entry.status, featured: entry.featured, displayOrder,
            technologies: technologyRefs(entry.technologyIds),
            capabilityEvidence: entry.capabilityEvidence.map(evidence => ({
                _key: evidence.capabilityId, _type: "evidence" as const,
                capability: reference(`capability-${evidence.capabilityId}`), priority: evidence.priority,
            })),
            highlights: [...entry.highlights],
            links: { github: entry.links.github, ...(entry.links.live === undefined ? {} : { live: entry.links.live }) },
        })),
        ...source.experiences.map(entry => ({
            _id: `experience-${entry.id}`, _type: "experience" as const, stableId: entry.id,
            organization: entry.organization, role: entry.role, startYear: parseYear(entry.startDate),
            ...(entry.endDate === null ? {} : { endYear: parseYear(entry.endDate) }),
            ...(entry.location === undefined ? {} : { location: entry.location }),
            summary: entry.summary, highlights: [...entry.highlights], technologies: technologyRefs(entry.technologyIds),
        })),
    ];
}

export type SanityMigrationDocument = ReturnType<typeof createDocuments>[number];

// Storage checks only: semantic validation stays in the existing runtime boundary.
function checkStorage(value: unknown): void {
    if (value === undefined || typeof value === "function" || typeof value === "symbol"
        || typeof value === "bigint" || (typeof value === "number" && !Number.isFinite(value))) {
        throw new Error("Migration contains a non-JSON value");
    }
    if (Array.isArray(value)) {
        const keys = new Set<string>();
        for (const item of value) {
            if (item !== null && typeof item === "object") {
                const key: unknown = item._key;
                if (typeof key !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) || keys.has(key)) {
                    throw new Error("Migration array has a missing, invalid or duplicate _key");
                }
                keys.add(key);
            }
            checkStorage(item);
        }
    } else if (value !== null && typeof value === "object") {
        if ("_weak" in value) throw new Error("Migration must not contain weak references");
        for (const child of Object.values(value)) checkStorage(child);
    }
}

/** Projects only the known generated shapes; this is not a general GROQ evaluator. */
export function projectSanityMigrationSnapshot(documents: readonly SanityMigrationDocument[]) {
    const byId = new Map<string, SanityMigrationDocument>();
    for (const document of documents) {
        if (byId.has(document._id)) throw new Error(`Duplicate migration document ID: ${document._id}`);
        if (document._id.startsWith("drafts.") || document._id.startsWith("versions.")) {
            throw new Error("Migration requires published document IDs");
        }
        checkStorage(document);
        byId.set(document._id, document);
    }
    const resolve = (ref: { _type: "reference"; _ref: string }) => {
        if (ref._type !== "reference") throw new Error("Expected a stored reference");
        const target = byId.get(ref._ref);
        return target && "stableId" in target
            ? { _id: target._id, _type: target._type, stableId: target.stableId }
            : null;
    };
    const site = byId.get("siteContent");
    return {
        profile: byId.get("profile") ?? null,
        siteContent: site?._type === "siteContent" ? {
            ...site, about: { ...site.about, education: site.about.education.map(entry => ({
                stableId: entry.stableId, institution: entry.institution, program: entry.program,
                startYear: entry.startYear, endYear: entry.endYear,
            })) },
        } : null,
        projects: documents.filter(doc => doc._type === "project").map(doc => ({
            ...doc, slug: doc.slug.current,
            technologies: doc.technologies.map(resolve),
            capabilityEvidence: doc.capabilityEvidence.map(entry => ({ capability: resolve(entry.capability), priority: entry.priority })),
        })),
        experiences: documents.filter(doc => doc._type === "experience").map(doc => ({
            ...doc, technologies: doc.technologies.map(resolve),
        })),
        technologies: documents.filter(doc => doc._type === "technology"),
        capabilityAreas: documents.filter(doc => doc._type === "capabilityArea"),
    };
}

/** Build and preflight before any serialization or filesystem operation. */
export function buildSanityMigrationDocuments(source: MappedSanityPortfolio): SanityMigrationDocument[] {
    const documents = createDocuments(source);
    parseSanityPortfolioSnapshot(projectSanityMigrationSnapshot(documents));
    return documents;
}

export function renderSanityMigrationNdjson(documents: readonly SanityMigrationDocument[]): string {
    // Recheck in case a caller modified the documents after building them.
    parseSanityPortfolioSnapshot(projectSanityMigrationSnapshot(documents));
    return documents.map(document => JSON.stringify(document)).join("\n") + "\n";
}
