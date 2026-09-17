import { describe, expect, it } from "vitest";
import type { Project } from "../domain/project";
import { projects as portfolioProjects } from "../data/projects";
import { ALL_STACK_ID, getStackCapabilityIds, stackGroups } from "../data/stacks";
import type { StackFilterId } from "../data/stacks";
import { getProjectsForStack } from "./projectFilters";

type EvidenceFixture = Pick<Project, "id" | "capabilityEvidence">;

describe("getProjectsForStack", () => {
    it("returns all projects unchanged in original order for ALL", () => {
        const projects = [
            { id: "a", capabilityEvidence: [{ capabilityId: "backend", priority: 2 }] },
            { id: "b", capabilityEvidence: [{ capabilityId: "backend", priority: 1 }] },
            { id: "c", capabilityEvidence: [] },
        ] as const satisfies readonly EvidenceFixture[];
        expect(getProjectsForStack(projects, ALL_STACK_ID)).toBe(projects);
    });

    it("filters by matching capability evidence", () => {
        const projects = [
            { id: "match-1", capabilityEvidence: [{ capabilityId: "integration", priority: 2 }] },
            { id: "missing-priority", capabilityEvidence: [] },
            { id: "wrong-stack", capabilityEvidence: [{ capabilityId: "backend", priority: 1 }] },
            { id: "match-2", capabilityEvidence: [{ capabilityId: "integration", priority: 1 }] },
        ] as const satisfies readonly EvidenceFixture[];
        expect(getProjectsForStack(projects, "integration").map(p => p.id))
            .toEqual(["match-2", "match-1"]);
    });

    it("sorts ascending without mutating input or copying projects", () => {
        const projects = Object.freeze([
            { id: "p2", capabilityEvidence: [{ capabilityId: "backend", priority: 2 }] },
            { id: "p1", capabilityEvidence: [{ capabilityId: "backend", priority: 1 }] },
        ] as const satisfies readonly EvidenceFixture[]);
        const result = getProjectsForStack(projects, "backend");
        expect(result.map(p => p.id)).toEqual(["p1", "p2"]);
        expect(result[0]).toBe(projects[1]);
        expect(result[1]).toBe(projects[0]);
        expect(projects.map(p => p.id)).toEqual(["p2", "p1"]);
    });

    it("returns maximum two projects", () => {
        const projects = [
            { id: "p1", capabilityEvidence: [{ capabilityId: "frontend", priority: 1 }] },
            { id: "p2", capabilityEvidence: [{ capabilityId: "frontend", priority: 2 }] },
            { id: "p3", capabilityEvidence: [{ capabilityId: "frontend", priority: 3 }] },
        ] as const satisfies readonly EvidenceFixture[];
        expect(getProjectsForStack(projects, "frontend").map(p => p.id)).toEqual(["p1", "p2"]);
    });

    it("handles projects with no evidence safely", () => {
        const projects = [
            { id: "no-priority", capabilityEvidence: [] },
            { id: "valid", capabilityEvidence: [{ capabilityId: "workflow", priority: 1 }] },
        ] as const satisfies readonly EvidenceFixture[];
        expect(getProjectsForStack(projects, "workflow").map(p => p.id)).toEqual(["valid"]);
        expect(getProjectsForStack(projects, "systems")).toEqual([]);
    });

    it("uses strongest matching evidence and preserves source order for ties", () => {
        const projects = [
            { id: "weak", capabilityEvidence: [{ capabilityId: "systems", priority: 3 }] },
            { id: "both", capabilityEvidence: [
                { capabilityId: "systems", priority: 2 },
                { capabilityId: "mobile", priority: 1 },
            ] },
            { id: "tie", capabilityEvidence: [{ capabilityId: "systems", priority: 1 }] },
            { id: "unrelated", capabilityEvidence: [{ capabilityId: "frontend", priority: 1 }] },
        ] as const satisfies readonly EvidenceFixture[];
        expect(getProjectsForStack(projects, "systems-mobile").map(p => p.id)).toEqual(["both", "tie"]);
    });

    const expectedIds = {
        frontend: ["krisefikser", "marketplace-fullstack"],
        backend: ["healthcare-interoperability-showcase", "krisefikser"],
        databases: ["healthcare-interoperability-showcase", "marketplace-fullstack"],
        integration: ["healthcare-interoperability-showcase", "network-programming"],
        workflow: ["krisefikser", "marketplace-fullstack"],
        mobile: ["mobile-development"],
        systems: ["cpp-coursework"],
        "systems-mobile": ["mobile-development", "cpp-coursework"],
        all: [
            "healthcare-interoperability-showcase", "krisefikser", "marketplace-fullstack",
            "mobile-development", "network-programming", "algorithms-data-structures", "cpp-coursework",
        ],
    } satisfies Record<StackFilterId, readonly string[]>;

    for (const { id } of [
        { id: "frontend" }, { id: "backend" }, { id: "databases" },
        { id: "integration" }, { id: "workflow" }, { id: "mobile" },
        { id: "systems" }, { id: "systems-mobile" }, { id: "all" },
    ] as const) {
        it(`preserves real fixture output for ${id}`, () => {
            expect(getProjectsForStack(portfolioProjects, id).map(p => p.id)).toEqual(expectedIds[id]);
        });
    }

    it("keeps combined group and individual technology click targets", () => {
        expect(getStackCapabilityIds("all")).toEqual([]);
        expect(getStackCapabilityIds("backend")).toEqual(["backend"]);
        expect(getStackCapabilityIds("systems-mobile")).toEqual(["systems", "mobile"]);
        const group = stackGroups.find(group => group.id === "systems-mobile");
        expect(group?.capabilities).toEqual(["systems", "mobile"]);
        expect(group?.items.map(item => [item.technologyId, item.stackId])).toEqual([
            ["cpp", "systems"], ["kotlin", "mobile"], ["mobile-apps", "mobile"],
        ]);
    });
});
