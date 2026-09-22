import { parseSanityPortfolioSnapshot, type SanityPortfolioSnapshot } from "./sanity-content-schema";

// Collection sorting belongs to the mapper. Array projections retain editorial order
// and unresolved references remain null so the runtime boundary rejects them.
export const SANITY_PORTFOLIO_QUERY = `{
    "profile": *[_id == "profile" && _type == "profile"][0]{
        _id, _type, name, professionalTitle, email, availabilityStatus,
        links{github, linkedin}
    },
    "siteContent": *[_id == "siteContent" && _type == "siteContent"][0]{
        _id, _type,
        hero{roles},
        about{
            label, heading, intro, story, beyondCode, currentFocus,
            currentFocusSummary, strengths,
            education[]{stableId, institution, program, startYear, endYear}
        },
        currentWork{primaryWork, buildLog, clientWork, focus}
    },
    "projects": *[_type == "project"]{
        _id, _type, stableId, "slug": slug.current,
        title, label, summary, year, status, featured, displayOrder, highlights,
        links{github, defined(live) => {live}},
        "technologies": technologies[]->{_id, _type, stableId},
        capabilityEvidence[]{
            "capability": capability->{_id, _type, stableId},
            priority
        }
    },
    "experiences": *[_type == "experience"]{
        _id, _type, stableId, organization, role, startYear, endYear, summary, highlights,
        defined(location) => {location},
        "technologies": technologies[]->{_id, _type, stableId}
    },
    "technologies": *[_type == "technology"]{_id, _type, stableId, label},
    "capabilityAreas": *[_type == "capabilityArea"]{_id, _type, stableId, label, description}
}`;

// A narrow structural interface permits offline fakes and accepts the real Sanity client.
type SnapshotReadClient = { fetch(query: string): Promise<unknown> };

/** One read, immediately validated; transport and validation failures propagate to the caller. */
export async function fetchSanityPortfolioSnapshot(client: SnapshotReadClient): Promise<SanityPortfolioSnapshot> {
    const raw: unknown = await client.fetch(SANITY_PORTFOLIO_QUERY);
    return parseSanityPortfolioSnapshot(raw);
}
