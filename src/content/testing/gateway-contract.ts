import { beforeEach, describe, expect, it } from "vitest";
import type { PortfolioContentGateway } from "../portfolio-content-gateway";

// Supply a stable content set with at least one project to exercise slug lookup.
export function portfolioContentGatewayContract(
    name: string,
    createGateway: () => PortfolioContentGateway | Promise<PortfolioContentGateway>,
): void {
    describe(`${name}: PortfolioContentGateway contract`, () => {
        let gateway: PortfolioContentGateway;

        beforeEach(async () => {
            gateway = await createGateway();
        });

        it("resolves a profile with a non-empty name and email", async () => {
            const profile = await gateway.getProfile();
            expect(profile.name.trim()).not.toBe("");
            expect(profile.email.trim()).not.toBe("");
        });

        it("returns unique project ids", async () => {
            const projects = await gateway.getProjects();
            expect(new Set(projects.map(project => project.id)).size).toBe(projects.length);
        });

        it("returns unique project slugs", async () => {
            const projects = await gateway.getProjects();
            expect(new Set(projects.map(project => project.slug)).size).toBe(projects.length);
        });

        it("returns unique technology ids", async () => {
            const technologies = await gateway.getTechnologies();
            expect(new Set(technologies.map(technology => technology.id)).size).toBe(technologies.length);
        });

        it("returns unique capability ids", async () => {
            const capabilities = await gateway.getCapabilityAreas();
            expect(new Set(capabilities.map(capability => capability.id)).size).toBe(capabilities.length);
        });

        it("resolves every project technology reference", async () => {
            const [projects, technologies] = await Promise.all([
                gateway.getProjects(), gateway.getTechnologies(),
            ]);
            const ids = new Set(technologies.map(technology => technology.id));
            for (const project of projects) {
                for (const id of project.technologyIds) expect(ids.has(id)).toBe(true);
            }
        });

        it("resolves every project capability reference", async () => {
            const [projects, capabilities] = await Promise.all([
                gateway.getProjects(), gateway.getCapabilityAreas(),
            ]);
            const ids = new Set(capabilities.map(capability => capability.id));
            for (const project of projects) {
                for (const evidence of project.capabilityEvidence) {
                    expect(ids.has(evidence.capabilityId)).toBe(true);
                }
            }
        });

        it("resolves every experience technology reference", async () => {
            const [experiences, technologies] = await Promise.all([
                gateway.getExperiences(), gateway.getTechnologies(),
            ]);
            const ids = new Set(technologies.map(technology => technology.id));
            for (const experience of experiences) {
                for (const id of experience.technologyIds) expect(ids.has(id)).toBe(true);
            }
        });

        it("looks up existing slugs with the same project identity", async () => {
            const projects = await gateway.getProjects();
            expect(projects.length).toBeGreaterThan(0);
            for (const project of projects) {
                const found = await gateway.getProjectBySlug(project.slug);
                expect(found).not.toBeNull();
                expect(found?.id).toBe(project.id);
                expect(found?.slug).toBe(project.slug);
            }
        });

        it("returns null for a missing slug", async () => {
            const projects = await gateway.getProjects();
            const slugs = new Set(projects.map(project => project.slug));
            let missingSlug = "missing-contract-project";
            while (slugs.has(missingSlug)) missingSlug += "-missing";
            await expect(gateway.getProjectBySlug(missingSlug)).resolves.toBeNull();
        });
    });
}
