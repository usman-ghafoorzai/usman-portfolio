import type { CapabilityArea, CapabilityAreaId } from "../domain/capability";

export const capabilityAreasById = {
    "frontend": {
        "id": "frontend",
        "label": "Frontend",
        "description": "Interfaces, layouts and interactive user experiences."
    },
    "backend": {
        "id": "backend",
        "label": "Backend",
        "description": "APIs, server-side logic and structured application development."
    },
    "databases": {
        "id": "databases",
        "label": "Databases",
        "description": "Data modeling, persistence and practical querying."
    },
    "integration": {
        "id": "integration",
        "label": "Integration",
        "description": "Connecting systems through APIs, standards and structured data exchange."
    },
    "mobile": {
        "id": "mobile",
        "label": "Mobile",
        "description": "Experience from study projects with native and hybrid mobile development."
    },
    "systems": {
        "id": "systems",
        "label": "Systems",
        "description": "Experience from study projects with lower-level and systems-oriented development."
    },
    "workflow": {
        "id": "workflow",
        "label": "Workflow",
        "description": "How I build, test, document and collaborate on software projects."
    }
} as const satisfies Record<CapabilityAreaId, CapabilityArea>;

export const capabilityAreas = Object.values(capabilityAreasById);
