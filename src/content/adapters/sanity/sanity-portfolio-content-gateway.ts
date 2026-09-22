import type { PortfolioContentGateway } from "../../portfolio-content-gateway";
import { mapSanityPortfolioSnapshot, type MappedSanityPortfolio } from "./sanity-content-mapper";
import { fetchSanityPortfolioSnapshot } from "./sanity-portfolio-query";

type SanitySnapshotClient = Parameters<typeof fetchSanityPortfolioSnapshot>[0];

export function createSanityPortfolioContentGateway(client: SanitySnapshotClient): PortfolioContentGateway {
    let snapshotPromise: Promise<MappedSanityPortfolio> | undefined;

    function loadSnapshot(): Promise<MappedSanityPortfolio> {
        snapshotPromise ??= fetchSanityPortfolioSnapshot(client)
            .then(mapSanityPortfolioSnapshot)
            .catch((error: unknown) => {
                // All callers of this load receive the failure. Only a later call may retry.
                snapshotPromise = undefined;
                throw error;
            });
        return snapshotPromise;
    }

    return {
        async getProfile() { return (await loadSnapshot()).profile; },
        async getSiteContent() { return (await loadSnapshot()).siteContent; },
        async getProjects() { return (await loadSnapshot()).projects; },
        async getProjectBySlug(slug) {
            return (await loadSnapshot()).projects.find(project => project.slug === slug) ?? null;
        },
        async getExperiences() { return (await loadSnapshot()).experiences; },
        async getTechnologies() { return (await loadSnapshot()).technologies; },
        async getCapabilityAreas() { return (await loadSnapshot()).capabilityAreas; },
    };
}
