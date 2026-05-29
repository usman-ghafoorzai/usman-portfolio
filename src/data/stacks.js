export const ALL_STACK_ID = "all";

export const stackGroups = [
    {
        id: "frontend",
        status: "OK",
        label: "Frontend",
        description: "Interfaces, layouts and interactive user experiences.",
        iconKey: "react",
        accentRgb: "97, 218, 251",
        items: [
            { label: "React", iconKey: "react" },
            { label: "JavaScript", iconKey: "javascript" },
            { label: "TypeScript", iconKey: "typescript" },
            { label: "HTML", iconKey: "html" },
            { label: "CSS", iconKey: "css" },
            { label: "Vite", iconKey: "vite" },
        ],
    },
    {
        id: "backend",
        status: "OK",
        label: "Backend",
        description: "APIs, server-side logic and structured application development.",
        iconKey: "node",
        accentRgb: "104, 211, 145",
        items: [
            { label: "Node.js", iconKey: "node" },
            { label: "NestJS", iconKey: "nestjs" },
            { label: "Java", iconKey: "java" },
            { label: "REST APIs", iconKey: "api" },
        ],
    },
    {
        id: "databases",
        status: "OK",
        label: "Databases",
        description: "Data modeling, persistence and practical querying.",
        iconKey: "database",
        accentRgb: "96, 165, 250",
        items: [
            { label: "PostgreSQL", iconKey: "postgresql" },
            { label: "Prisma", iconKey: "prisma" },
            { label: "SQL", iconKey: "database" },
        ],
    },
    {
        id: "integration",
        status: "OK",
        label: "Integration",
        description: "Connecting systems through APIs, standards and structured data exchange.",
        iconKey: "integration",
        accentRgb: "192, 132, 252",
        items: [
            { label: "FHIR", iconKey: "healthcare" },
            { label: "openEHR", iconKey: "healthcare" },
            { label: "API Design", iconKey: "api" },
            { label: "Docker", iconKey: "docker" },
        ],
    },
    {
        id: "systems-mobile",
        status: "OK",
        label: "Systems & Mobile",
        description: "Experience from study projects with lower-level and mobile development.",
        iconKey: "mobile",
        accentRgb: "45, 212, 191",
        items: [
            { label: "C++", iconKey: "cpp", stackId: "systems" },
            { label: "Kotlin", iconKey: "kotlin", stackId: "mobile" },
            { label: "Mobile Apps", iconKey: "mobile", stackId: "mobile" },
        ],
    },
    {
        id: "workflow",
        status: "OK",
        label: "Workflow",
        description: "How I build, test, document and collaborate on software projects.",
        iconKey: "workflow",
        accentRgb: "251, 146, 60",
        items: [
            { label: "Git", iconKey: "git" },
            { label: "GitHub", iconKey: "github" },
            { label: "Swagger", iconKey: "swagger" },
            { label: "Jest", iconKey: "jest" },
            { label: "Agile", iconKey: "agile" },
        ],
    },
];

export const stackFilters = [
    {
        id: ALL_STACK_ID,
        label: "All",
    },
    ...stackGroups.map((stack) => ({
        id: stack.id,
        label: stack.label,
    })),
    {
        id: "mobile",
        label: "Mobile",
    },
    {
        id: "systems",
        label: "Systems",
    },
];

export function getStackLabel(stackId) {
    return stackFilters.find((stack) => stack.id === stackId)?.label ?? "All";
}

export function isValidStackId(stackId) {
    return stackFilters.some((stack) => stack.id === stackId);
}

export function getStackAccentRgb(stackId) {
    return stackGroups.find((stack) => stack.id === stackId)?.accentRgb ?? "255, 255, 255";
}
