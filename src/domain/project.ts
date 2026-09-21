import type { CapabilityAreaId } from "./capability";

/** Lower numbers indicate stronger evidence. */
export type EvidencePriority = 1 | 2 | 3;

export type ProjectEvidence = {
    readonly capabilityId: CapabilityAreaId;
    readonly priority: EvidencePriority;
};

export type ProjectStatus = "completed" | "in-progress" | "archived";

export type ProjectLinks = {
    readonly github?: string;
    readonly live?: string;
};

export type Project = {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly label: string;
    readonly summary: string;
    readonly year: number;
    readonly status: ProjectStatus;
    readonly featured: boolean;
    readonly technologyIds: readonly string[];
    readonly capabilityEvidence: readonly ProjectEvidence[];
    readonly highlights: readonly string[];
    readonly links: ProjectLinks;
};
