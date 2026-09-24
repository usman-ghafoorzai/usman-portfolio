import * as v from "valibot";
import { CAPABILITY_AREA_IDS } from "../../../domain/capability";

const text = v.pipe(v.string(), v.check(value => value.trim().length > 0, "Expected non-whitespace text"));
const stableId = v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid stableId"));
const sourceId = v.pipe(text, v.check(value =>
    !value.startsWith("drafts.") && !value.startsWith("versions."), "Expected a published source identity"));
const httpUrl = v.pipe(v.string(), v.url(), v.regex(/^https?:\/\//i, "Expected an absolute HTTP(S) URL"));
const year = v.pipe(v.number(), v.integer(), v.minValue(1900), v.maxValue(2100));
const paragraphs = v.array(text);
const requiredParagraphs = v.pipe(paragraphs, v.minLength(1));
const capabilityId = v.picklist(CAPABILITY_AREA_IDS);

// These are resolved query projections, not raw {_ref} objects or trusted string IDs.
const technologyReference = v.object({ _id: sourceId, _type: v.literal("technology"), stableId });
const capabilityReference = v.pipe(
    v.object({ _id: sourceId, _type: v.literal("capabilityArea"), stableId: capabilityId }),
    v.check(value => value._id === `capability-${value.stableId}`, "Capability source identity mismatch"),
);
const education = v.pipe(v.object({
    stableId, institution: text, program: text, startYear: year, endYear: year,
}), v.check(value => value.endYear >= value.startYear, "Education ends before it starts"));

const snapshotSchema = v.object({
    profile: v.object({
        _id: v.literal("profile"), _type: v.literal("profile"),
        name: text, professionalTitle: text, email: v.pipe(text, v.email()), availabilityStatus: text,
        links: v.object({ github: httpUrl, linkedin: httpUrl }),
    }),
    siteContent: v.object({
        _id: v.literal("siteContent"), _type: v.literal("siteContent"),
        hero: v.object({ roles: requiredParagraphs }),
        about: v.object({
            label: text, heading: text, intro: text, story: requiredParagraphs,
            beyondCode: requiredParagraphs, currentFocus: requiredParagraphs,
            currentFocusSummary: text, strengths: requiredParagraphs,
            education: v.pipe(v.array(education), v.minLength(1)),
        }),
        currentWork: v.object({
            primaryWork: text, buildLog: requiredParagraphs, clientWork: paragraphs, focus: requiredParagraphs,
        }),
    }),
    projects: v.array(v.object({
        _id: sourceId, _type: v.literal("project"), stableId, slug: text,
        title: text, label: text, summary: text, year,
        status: v.picklist(["completed", "in-progress", "archived"]), featured: v.boolean(),
        displayOrder: v.pipe(v.number(), v.integer(), v.minValue(0)),
        technologies: v.array(technologyReference),
        capabilityEvidence: v.array(v.object({
            capability: capabilityReference, priority: v.picklist([1, 2, 3]),
        })),
        highlights: requiredParagraphs,
        links: v.object({ github: httpUrl, live: v.exactOptional(httpUrl) }),
    })),
    experiences: v.array(v.pipe(v.object({
        _id: sourceId, _type: v.literal("experience"), stableId, organization: text, role: text,
        startYear: year, endYear: v.exactOptional(v.nullable(year)),
        location: v.exactOptional(text), summary: text, highlights: paragraphs,
        technologies: v.array(technologyReference),
    }), v.check(value => value.endYear == null || value.endYear >= value.startYear, "Experience ends before it starts"))),
    technologies: v.array(v.object({ ...technologyReference.entries, label: text })),
    capabilityAreas: v.array(v.pipe(v.object({
        _id: sourceId, _type: v.literal("capabilityArea"), stableId: capabilityId, label: text, description: text,
    }), v.check(value => value._id === `capability-${value.stableId}`, "Capability source identity mismatch"))),
});

type ParsedSnapshot = v.InferOutput<typeof snapshotSchema>;
// The branded DTO is exposed only after structural and snapshot validation succeed.
const validatedSchema = v.pipe(snapshotSchema, v.brand("ValidatedSanityPortfolioSnapshot"));
export type SanityPortfolioSnapshot = v.InferOutput<typeof validatedSchema>;

function unique(values: readonly string[], path: string): void {
    const seen = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) throw new Error(`Invalid Sanity snapshot: duplicate ${path}: ${value}`);
        seen.add(value);
    }
}

function validateInvariants(dto: ParsedSnapshot): void {
    unique(dto.projects.map(value => value.stableId), "projects.stableId");
    unique(dto.projects.map(value => value.slug), "projects.slug");
    unique(dto.experiences.map(value => value.stableId), "experiences.stableId");
    unique(dto.technologies.map(value => value.stableId), "technologies.stableId");
    unique(dto.siteContent.about.education.map(value => value.stableId), "about.education.stableId");
    unique(dto.capabilityAreas.map(value => value.stableId), "capabilityAreas.stableId");
    // One storage document cannot supply two different domain identities.
    unique([
        dto.profile._id, dto.siteContent._id,
        ...dto.projects.map(value => value._id), ...dto.experiences.map(value => value._id),
        ...dto.technologies.map(value => value._id), ...dto.capabilityAreas.map(value => value._id),
    ], "source _id");

    const capabilities = new Map(dto.capabilityAreas.map(value => [value.stableId, value._id]));
    for (const id of CAPABILITY_AREA_IDS) {
        if (!capabilities.has(id)) throw new Error(`Invalid Sanity snapshot: missing capability ${id}`);
    }
    const technologies = new Map(dto.technologies.map(value => [value.stableId, value._id]));
    function technologyRefs(refs: ParsedSnapshot["projects"][number]["technologies"], path: string) {
        unique(refs.map(ref => ref.stableId), `${path}.technologies`);
        for (const ref of refs) {
            if (technologies.get(ref.stableId) !== ref._id) {
                throw new Error(`Invalid Sanity snapshot: ${path} technology ${ref.stableId} missing or source identity mismatch`);
            }
        }
    }
    for (const project of dto.projects) {
        technologyRefs(project.technologies, `project ${project.stableId}`);
        unique(project.capabilityEvidence.map(value => value.capability.stableId), `project ${project.stableId}.capabilityEvidence`);
        for (const { capability } of project.capabilityEvidence) {
            if (capabilities.get(capability.stableId) !== capability._id) {
                throw new Error(`Invalid Sanity snapshot: project ${project.stableId} capability ${capability.stableId} missing or source identity mismatch`);
            }
        }
    }
    for (const experience of dto.experiences) technologyRefs(experience.technologies, `experience ${experience.stableId}`);
}

/** Parse a future query result. Unknown metadata is stripped; semantic values are never coerced. */
export function parseSanityPortfolioSnapshot(input: unknown): SanityPortfolioSnapshot {
    const dto = v.parse(validatedSchema, input);
    validateInvariants(dto);
    return dto;
}
