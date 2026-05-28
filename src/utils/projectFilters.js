import { ALL_STACK_ID } from "../data/stacks";

export function getProjectsForStack(projects, stackId) {
    if (stackId === ALL_STACK_ID) return projects;

    return projects
        .filter((project) => {
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

export function splitFeaturedProject(projects) {
    const featuredProject =
        projects.find((project) => project.featured) ?? projects[0] ?? null;

    return {
        featuredProject,
        secondaryProjects: featuredProject
            ? projects.filter((project) => project.id !== featuredProject.id)
            : [],
    };
}
