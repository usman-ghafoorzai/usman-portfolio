import type { Project } from "../domain/project";
import { ALL_STACK_ID, getStackCapabilityIds } from "../data/stacks";
import type { StackFilterId } from "../data/stacks";

export function getProjectsForStack<T extends Pick<Project, "capabilityEvidence">>(
    projects: readonly T[],
    stackId: StackFilterId,
): readonly T[] {
    if (stackId === ALL_STACK_ID) return projects;

    const capabilityIds = getStackCapabilityIds(stackId);

    return projects
        .map((project) => ({
            project,
            priority: project.capabilityEvidence.reduce(
                (strongest, evidence) => capabilityIds.includes(evidence.capabilityId)
                    ? Math.min(strongest, evidence.priority)
                    : strongest,
                Infinity,
            ),
        }))
        .filter(({ priority }) => Number.isFinite(priority))
        // Stable sorting preserves source order for equally strong evidence.
        .sort((first, second) => first.priority - second.priority)
        .slice(0, 2)
        .map(({ project }) => project);
}
