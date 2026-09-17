import type { PortfolioContentGateway } from "../content/portfolio-content-gateway";
import type { CapabilityArea } from "../domain/capability";
import type { Experience } from "../domain/experience";
import type { Profile } from "../domain/profile";
import type { Project } from "../domain/project";
import type { Technology } from "../domain/technology";

export type PortfolioContent = {
    readonly profile: Profile;
    readonly projects: readonly Project[];
    readonly experiences: readonly Experience[];
    readonly technologies: readonly Technology[];
    readonly capabilityAreas: readonly CapabilityArea[];
};

export async function loadPortfolioContent(
    gateway: PortfolioContentGateway,
): Promise<PortfolioContent> {
    const [profile, projects, experiences, technologies, capabilityAreas] = await Promise.all([
        gateway.getProfile(),
        gateway.getProjects(),
        gateway.getExperiences(),
        gateway.getTechnologies(),
        gateway.getCapabilityAreas(),
    ]);

    return { profile, projects, experiences, technologies, capabilityAreas };
}
