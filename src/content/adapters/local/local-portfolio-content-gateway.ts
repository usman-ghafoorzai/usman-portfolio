import type { PortfolioContentGateway } from "../../portfolio-content-gateway";
import { capabilityAreas } from "../../../data/capabilities";
import { experiences } from "../../../data/experiences";
import { profile } from "../../../data/profile";
import { projects } from "../../../data/projects";
import { technologies } from "../../../data/technologies";
import { siteContent } from "../../../data/siteContent";

export const localPortfolioContentGateway: PortfolioContentGateway = {
    async getProfile() {
        return profile;
    },
    async getSiteContent() {
        return siteContent;
    },
    async getProjects() {
        return projects;
    },
    async getProjectBySlug(slug) {
        return projects.find((project) => project.slug === slug) ?? null;
    },
    async getExperiences() {
        return [...experiences].sort((a, b) =>
            a.startDate.localeCompare(b.startDate)
            || (a.endDate ?? "9999").localeCompare(b.endDate ?? "9999"),
        );
    },
    async getTechnologies() {
        return technologies;
    },
    async getCapabilityAreas() {
        return capabilityAreas;
    },
};
