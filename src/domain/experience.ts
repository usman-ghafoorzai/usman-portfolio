export type Experience = {
    readonly id: string;
    readonly organization: string;
    readonly role: string;
    readonly startDate: string;
    readonly endDate: string | null;
    readonly location?: string;
    readonly summary: string;
    readonly highlights: readonly string[];
    readonly technologyIds: readonly string[];
};
