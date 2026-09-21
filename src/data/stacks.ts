import type { CapabilityAreaId } from "../domain/capability";
import type { LocalTechnologyId } from "./technologies";

export const ALL_STACK_ID = "all";
export type StackFilterId = typeof ALL_STACK_ID | CapabilityAreaId | "systems-mobile";

type StackItem = {
    readonly technologyId: LocalTechnologyId;
    readonly iconKey: string;
    readonly stackId?: StackFilterId;
};

type StackGroup = {
    readonly id: Exclude<StackFilterId, "all">;
    readonly status: string;
    readonly label: string;
    readonly description: string;
    readonly iconKey: string;
    readonly accentRgb: string;
    readonly capabilities: readonly CapabilityAreaId[];
    readonly items: readonly StackItem[];
};

export const stackGroups: readonly StackGroup[] = [
    {
        "id": "frontend",
        "status": "OK",
        "label": "Frontend",
        "description": "Interfaces, layouts and interactive user experiences.",
        "iconKey": "react",
        "accentRgb": "97, 218, 251",
        "items": [
            {
                "technologyId": "react",
                "iconKey": "react"
            },
            {
                "technologyId": "javascript",
                "iconKey": "javascript"
            },
            {
                "technologyId": "typescript",
                "iconKey": "typescript"
            },
            {
                "technologyId": "html",
                "iconKey": "html"
            },
            {
                "technologyId": "css",
                "iconKey": "css"
            },
            {
                "technologyId": "vite",
                "iconKey": "vite"
            }
        ],
        "capabilities": [
            "frontend"
        ]
    },
    {
        "id": "backend",
        "status": "OK",
        "label": "Backend",
        "description": "APIs, server-side logic and structured application development.",
        "iconKey": "node",
        "accentRgb": "104, 211, 145",
        "items": [
            {
                "technologyId": "nodejs",
                "iconKey": "node"
            },
            {
                "technologyId": "nestjs",
                "iconKey": "nestjs"
            },
            {
                "technologyId": "java",
                "iconKey": "java"
            },
            {
                "technologyId": "rest-apis",
                "iconKey": "api"
            }
        ],
        "capabilities": [
            "backend"
        ]
    },
    {
        "id": "databases",
        "status": "OK",
        "label": "Databases",
        "description": "Data modeling, persistence and practical querying.",
        "iconKey": "database",
        "accentRgb": "96, 165, 250",
        "items": [
            {
                "technologyId": "postgresql",
                "iconKey": "postgresql"
            },
            {
                "technologyId": "prisma",
                "iconKey": "prisma"
            },
            {
                "technologyId": "sql",
                "iconKey": "database"
            }
        ],
        "capabilities": [
            "databases"
        ]
    },
    {
        "id": "integration",
        "status": "OK",
        "label": "Integration",
        "description": "Connecting systems through APIs, standards and structured data exchange.",
        "iconKey": "integration",
        "accentRgb": "192, 132, 252",
        "items": [
            {
                "technologyId": "fhir",
                "iconKey": "healthcare"
            },
            {
                "technologyId": "openehr",
                "iconKey": "healthcare"
            },
            {
                "technologyId": "api-design",
                "iconKey": "api"
            },
            {
                "technologyId": "docker",
                "iconKey": "docker"
            }
        ],
        "capabilities": [
            "integration"
        ]
    },
    {
        "id": "systems-mobile",
        "status": "OK",
        "label": "Systems & Mobile",
        "description": "Experience from study projects with lower-level and mobile development.",
        "iconKey": "mobile",
        "accentRgb": "45, 212, 191",
        "items": [
            {
                "technologyId": "cpp",
                "iconKey": "cpp",
                "stackId": "systems"
            },
            {
                "technologyId": "kotlin",
                "iconKey": "kotlin",
                "stackId": "mobile"
            },
            {
                "technologyId": "mobile-apps",
                "iconKey": "mobile",
                "stackId": "mobile"
            }
        ],
        "capabilities": [
            "systems",
            "mobile"
        ]
    },
    {
        "id": "workflow",
        "status": "OK",
        "label": "Workflow",
        "description": "How I build, test, document and collaborate on software projects.",
        "iconKey": "workflow",
        "accentRgb": "251, 146, 60",
        "items": [
            {
                "technologyId": "git",
                "iconKey": "git"
            },
            {
                "technologyId": "github",
                "iconKey": "github"
            },
            {
                "technologyId": "swagger",
                "iconKey": "swagger"
            },
            {
                "technologyId": "jest",
                "iconKey": "jest"
            },
            {
                "technologyId": "agile",
                "iconKey": "agile"
            }
        ],
        "capabilities": [
            "workflow"
        ]
    }
];

export const stackFilters: readonly { readonly id: StackFilterId; readonly label: string }[] = [
    { id: ALL_STACK_ID, label: "All" },
    ...stackGroups.map((stack) => ({ id: stack.id, label: stack.label })),
    { id: "mobile", label: "Mobile" },
    { id: "systems", label: "Systems" },
];

export function getStackLabel(stackId: string): string {
    return stackFilters.find((stack) => stack.id === stackId)?.label ?? "All";
}

export function isValidStackId(stackId: unknown): stackId is StackFilterId {
    return stackFilters.some((stack) => stack.id === stackId);
}

export function getStackAccentRgb(stackId: string): string {
    return stackGroups.find((stack) => stack.id === stackId)?.accentRgb ?? "255, 255, 255";
}

export function getStackCapabilityIds(stackId: StackFilterId): readonly CapabilityAreaId[] {
    if (stackId === ALL_STACK_ID) return [];
    if (stackId === "systems-mobile") return ["systems", "mobile"];
    return [stackId];
}
