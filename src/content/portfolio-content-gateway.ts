import type { CapabilityArea } from "../domain/capability";
import type { Experience } from "../domain/experience";
import type { Profile } from "../domain/profile";
import type { Project } from "../domain/project";
import type { Technology } from "../domain/technology";

export interface PortfolioContentGateway {
    getProfile(): Promise<Profile>;
    getProjects(): Promise<readonly Project[]>;
    getProjectBySlug(slug: string): Promise<Project | null>;
    getExperiences(): Promise<readonly Experience[]>;
    getTechnologies(): Promise<readonly Technology[]>;
    getCapabilityAreas(): Promise<readonly CapabilityArea[]>;
}
