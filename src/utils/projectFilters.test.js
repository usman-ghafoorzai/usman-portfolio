import { describe, expect, it } from "vitest";
import { ALL_STACK_ID } from "../data/stacks";
import { getProjectsForStack } from "./projectFilters";

describe("getProjectsForStack", () => {
    it("returns all projects unchanged for ALL stack", () => {
        const projects = [
            { id: "a", stackEvidencePriority: { backend: 2 } },
            { id: "b", stackEvidencePriority: { backend: 1 } },
            { id: "c" },
        ];

        const result = getProjectsForStack(projects, ALL_STACK_ID);

        expect(result).toHaveLength(projects.length);
        expect(result.map((project) => project.id)).toEqual(
            projects.map((project) => project.id),
        );
    });

    it("filters by stackEvidencePriority for selected stack", () => {
        const projects = [
            { id: "match-1", stackEvidencePriority: { integration: 2 } },
            { id: "missing-priority" },
            { id: "wrong-stack", stackEvidencePriority: { backend: 1 } },
            { id: "match-2", stackEvidencePriority: { integration: 1 } },
        ];

        const result = getProjectsForStack(projects, "integration");

        expect(result.map((project) => project.id)).toEqual([
            "match-2",
            "match-1",
        ]);
    });

    it("sorts selected stack results by ascending priority", () => {
        const projects = [
            { id: "p2", stackEvidencePriority: { backend: 2 } },
            { id: "p1", stackEvidencePriority: { backend: 1 } },
        ];

        const result = getProjectsForStack(projects, "backend");

        expect(result.map((project) => project.id)).toEqual(["p1", "p2"]);
    });

    it("returns maximum two projects for selected stack", () => {
        const projects = [
            { id: "p1", stackEvidencePriority: { frontend: 1 } },
            { id: "p2", stackEvidencePriority: { frontend: 2 } },
            { id: "p3", stackEvidencePriority: { frontend: 3 } },
        ];

        const result = getProjectsForStack(projects, "frontend");

        expect(result).toHaveLength(2);
        expect(result.map((project) => project.id)).toEqual(["p1", "p2"]);
    });

    it("handles project without stackEvidencePriority safely", () => {
        const projects = [
            { id: "no-priority" },
            { id: "valid", stackEvidencePriority: { workflow: 1 } },
        ];

        expect(() => getProjectsForStack(projects, "workflow")).not.toThrow();

        const result = getProjectsForStack(projects, "workflow");
        expect(result.map((project) => project.id)).toEqual(["valid"]);
    });
});
