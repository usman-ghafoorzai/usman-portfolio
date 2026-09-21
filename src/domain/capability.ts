export const CAPABILITY_AREA_IDS = [
    "frontend",
    "backend",
    "databases",
    "integration",
    "mobile",
    "systems",
    "workflow",
] as const;

export type CapabilityAreaId = (typeof CAPABILITY_AREA_IDS)[number];

export type CapabilityArea = {
    readonly id: CapabilityAreaId;
    readonly label: string;
    readonly description: string;
};
