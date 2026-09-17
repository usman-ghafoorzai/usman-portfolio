import { ALL_STACK_ID } from "../data/stacks";

type StackPriorities = {
    stackEvidencePriority?: Partial<Record<string, number>>;
};

export function getProjectsForStack<T extends StackPriorities, K extends string>(
    projects: T[],
    stackId: K,
): T[] {
    if (stackId === ALL_STACK_ID) return projects;

    return projects
        .filter((project): project is T & { stackEvidencePriority: Record<K, number> } => {
            const priority = project.stackEvidencePriority?.[stackId];
            return Number.isFinite(priority);
        })
        .sort((firstProject, secondProject) => {
            return (
                firstProject.stackEvidencePriority[stackId] -
                secondProject.stackEvidencePriority[stackId]
            );
        })
        .slice(0, 2);
}
