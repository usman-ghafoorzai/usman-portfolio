import { expect, it } from "vitest";
import type { PortfolioContentGateway } from "../content/portfolio-content-gateway";
import type { PortfolioContent } from "./portfolio-content";
import { loadPortfolioContent } from "./portfolio-content";

it("loads the five gateway values into the content snapshot", async () => {
    const content: PortfolioContent = {
        profile: {
            name: "Test Developer",
            professionalTitle: "Engineer",
            email: "developer@example.com",
            availabilityStatus: "Available",
            links: { github: "https://example.com/github", linkedin: "https://example.com/linkedin" },
        },
        projects: [],
        experiences: [],
        technologies: [],
        capabilityAreas: [],
    };
    const gateway: PortfolioContentGateway = {
        async getProfile() { return content.profile; },
        async getProjects() { return content.projects; },
        async getExperiences() { return content.experiences; },
        async getTechnologies() { return content.technologies; },
        async getCapabilityAreas() { return content.capabilityAreas; },
        async getProjectBySlug() { throw new Error("Snapshot loading must not request a project by slug"); },
    };

    const snapshot = await loadPortfolioContent(gateway);

    expect(snapshot.profile).toBe(content.profile);
    expect(snapshot.projects).toBe(content.projects);
    expect(snapshot.experiences).toBe(content.experiences);
    expect(snapshot.technologies).toBe(content.technologies);
    expect(snapshot.capabilityAreas).toBe(content.capabilityAreas);
});
