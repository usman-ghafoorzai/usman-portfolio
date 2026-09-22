import { CAPABILITY_AREA_IDS, type CapabilityArea } from "../../../domain/capability";
import type { Experience } from "../../../domain/experience";
import type { Profile } from "../../../domain/profile";
import type { Project } from "../../../domain/project";
import type { SiteContent } from "../../../domain/site-content";
import type { Technology } from "../../../domain/technology";
import type { SanityPortfolioSnapshot } from "./sanity-content-schema";

export type MappedSanityPortfolio = {
    readonly profile: Profile;
    readonly siteContent: SiteContent;
    readonly projects: readonly Project[];
    readonly experiences: readonly Experience[];
    readonly technologies: readonly Technology[];
    readonly capabilityAreas: readonly CapabilityArea[];
};

// Code-point ordering is deterministic across browser/server locales for ASCII stable IDs.
const compareIds = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** Only accepts the DTO returned by parseSanityPortfolioSnapshot; does not fetch or select a source. */
export function mapSanityPortfolioSnapshot(dto: SanityPortfolioSnapshot): MappedSanityPortfolio {
    const { profile, siteContent } = dto;
    const { about, currentWork } = siteContent;
    return {
        profile: {
            name: profile.name, professionalTitle: profile.professionalTitle,
            email: profile.email, availabilityStatus: profile.availabilityStatus,
            links: { github: profile.links.github, linkedin: profile.links.linkedin },
        },
        siteContent: {
            hero: { roles: [...siteContent.hero.roles] },
            about: {
                label: about.label, heading: about.heading, intro: about.intro,
                story: [...about.story], beyondCode: [...about.beyondCode], currentFocus: [...about.currentFocus],
                currentFocusSummary: about.currentFocusSummary, strengths: [...about.strengths],
                education: about.education.map(entry => ({
                    id: entry.stableId, institution: entry.institution, program: entry.program,
                    startYear: entry.startYear, endYear: entry.endYear,
                })),
            },
            currentWork: {
                primaryWork: currentWork.primaryWork, buildLog: [...currentWork.buildLog],
                clientWork: [...currentWork.clientWork], focus: [...currentWork.focus],
            },
        },
        projects: [...dto.projects]
            .sort((a, b) => a.displayOrder - b.displayOrder || compareIds(a.stableId, b.stableId))
            .map(project => ({
                id: project.stableId, slug: project.slug, title: project.title, label: project.label,
                summary: project.summary, year: project.year, status: project.status, featured: project.featured,
                technologyIds: project.technologies.map(ref => ref.stableId),
                capabilityEvidence: project.capabilityEvidence.map(({ capability, priority }) => ({ capabilityId: capability.stableId, priority })),
                highlights: [...project.highlights],
                links: { github: project.links.github, ...(project.links.live === undefined ? {} : { live: project.links.live }) },
            })),
        experiences: [...dto.experiences]
            .sort((a, b) => a.startYear - b.startYear
                || (a.endYear ?? Infinity) - (b.endYear ?? Infinity)
                || compareIds(a.stableId, b.stableId))
            .map(experience => ({
                id: experience.stableId, organization: experience.organization, role: experience.role,
                startDate: String(experience.startYear), endDate: experience.endYear == null ? null : String(experience.endYear),
                ...(experience.location === undefined ? {} : { location: experience.location }),
                summary: experience.summary, highlights: [...experience.highlights],
                technologyIds: experience.technologies.map(ref => ref.stableId),
            })),
        technologies: [...dto.technologies].sort((a, b) => compareIds(a.stableId, b.stableId))
            .map(technology => ({ id: technology.stableId, label: technology.label })),
        capabilityAreas: [...dto.capabilityAreas]
            .sort((a, b) => CAPABILITY_AREA_IDS.indexOf(a.stableId) - CAPABILITY_AREA_IDS.indexOf(b.stableId))
            .map(capability => ({ id: capability.stableId, label: capability.label, description: capability.description })),
    };
}
