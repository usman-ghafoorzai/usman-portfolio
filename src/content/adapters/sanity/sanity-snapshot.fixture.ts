import { CAPABILITY_AREA_IDS } from "../../../domain/capability";

export function sanitySnapshotFixture() {
    const technologies = ["typescript", "react"].map(stableId => ({
        _id: `storage-${stableId}`, _type: "technology", stableId, label: stableId,
    }));
    const capabilityAreas = [...CAPABILITY_AREA_IDS].reverse().map(stableId => ({
        _id: `capability.${stableId}`, _type: "capabilityArea", stableId,
        label: stableId, description: `${stableId} description`,
    }));
    const project = (stableId: string, displayOrder: number) => ({
        _id: `storage-${stableId}`, _type: "project", stableId, slug: `${stableId}-slug`,
        title: "Project", label: "Label", summary: "Summary", year: 2025,
        status: "completed", featured: false, displayOrder, technologies: technologies.map(entry => ({ ...entry })),
        capabilityEvidence: capabilityAreas.slice(0, 2).map(capability => ({ capability: { ...capability }, priority: 2 })),
        highlights: ["Second editorial item", "First editorial item"],
        links: { github: "https://github.com/example/project" },
    });
    const experience = (stableId: string, startYear: number, endYear: number | null) => ({
        _id: `storage-${stableId}`, _type: "experience", stableId, startYear, endYear,
        organization: "Organization", role: "Developer", summary: "Summary",
        highlights: ["Later", "Earlier"], technologies: technologies.map(entry => ({ ...entry })),
    });
    return {
        profile: {
            _id: "profile", _type: "profile", name: "Example", professionalTitle: "Developer",
            email: "example@example.com", availabilityStatus: "Available",
            links: { github: "https://github.com/example", linkedin: "https://linkedin.com/in/example" },
        },
        siteContent: {
            _id: "siteContent", _type: "siteContent", hero: { roles: ["Developer", "Designer"] },
            about: {
                label: "About", heading: "Hello", intro: "Introduction", story: ["Two", "One"],
                beyondCode: ["Music", "Walking"], currentFocus: ["APIs", "UI"],
                currentFocusSummary: "Building", strengths: ["Testing", "Design"],
                education: ["degree-z", "degree-a"].map(stableId => ({
                    stableId, _key: `key-${stableId}`, _id: `storage-${stableId}`,
                    institution: "University", program: "Computing", startYear: 2018, endYear: 2021,
                })),
            },
            currentWork: { primaryWork: "Portfolio", buildLog: ["B", "A"], clientWork: [], focus: ["B", "A"] },
        },
        projects: [project("project-z", 1), project("project-a", 1), project("project-first", 0)],
        experiences: [experience("job-z", 2020, null), experience("job-b", 2020, 2023),
            experience("job-old", 2019, 2024), experience("job-a", 2020, 2023), experience("job-y", 2020, null)],
        technologies, capabilityAreas,
    };
}
