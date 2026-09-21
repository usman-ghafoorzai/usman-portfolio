import type { PortfolioContentGateway } from "../../portfolio-content-gateway";
import { capabilityAreas } from "../../../data/capabilities";
import { experiences } from "../../../data/experiences";
import { profile } from "../../../data/profile";
import { projects } from "../../../data/projects";
import { technologies } from "../../../data/technologies";

export const localPortfolioContentGateway: PortfolioContentGateway = {
    async getProfile() {
        return profile;
    },
    async getProjects() {
        return projects;
    },
    async getProjectBySlug(slug) {
        return projects.find((project) => project.slug === slug) ?? null;
    },
    async getExperiences() {
        return experiences;
    },
    async getTechnologies() {
        return technologies;
    },
    async getCapabilityAreas() {
        return capabilityAreas;
    },
};
