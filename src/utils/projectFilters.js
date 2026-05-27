import { ALL_STACK_ID } from "../data/stacks";
import { projectStackMap } from "../data/projectStackMap";

export function getProjectsForStack(projects, stackId) {
    if (stackId === ALL_STACK_ID) return projects;

    const selectedProjectIds = projectStackMap[stackId] ?? [];

    return selectedProjectIds
        .map((projectId) => projects.find((project) => project.id === projectId))
        .filter(Boolean);
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