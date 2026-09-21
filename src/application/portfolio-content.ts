import type { PortfolioContentGateway } from "../content/portfolio-content-gateway";
import type { CapabilityArea } from "../domain/capability";
import type { Experience } from "../domain/experience";
import type { Profile } from "../domain/profile";
import type { Project } from "../domain/project";
import type { Technology } from "../domain/technology";
import type { SiteContent } from "../domain/site-content";

export type PortfolioContent = {
    readonly profile: Profile;
    readonly siteContent: SiteContent;
    readonly projects: readonly Project[];
    readonly experiences: readonly Experience[];
    readonly technologies: readonly Technology[];
    readonly capabilityAreas: readonly CapabilityArea[];
};

export async function loadPortfolioContent(
    gateway: PortfolioContentGateway,
): Promise<PortfolioContent> {
    const [profile, siteContent, projects, experiences, technologies, capabilityAreas] = await Promise.all([
        gateway.getProfile(),
        gateway.getSiteContent(),
        gateway.getProjects(),
        gateway.getExperiences(),
        gateway.getTechnologies(),
        gateway.getCapabilityAreas(),
    ]);

    return { profile, siteContent, projects, experiences, technologies, capabilityAreas };
}
