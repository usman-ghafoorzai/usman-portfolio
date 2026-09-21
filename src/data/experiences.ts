import type { Experience } from "../domain/experience";

// Only years are known; do not invent months, locations or technology relationships.
export const experiences: readonly Experience[] = [
    {
        id: "solor-lab-assistant",
        organization: "Solor",
        role: "Technical lab assistant",
        startDate: "2017",
        endDate: "2019",
        summary: "Technical lab work taught me structured data handling, quality assurance and careful process routines.",
        highlights: [],
        technologyIds: [],
    },
    {
        id: "sit-student-host",
        organization: "Sit Trondheim",
        role: "Student host",
        startDate: "2020",
        endDate: "2023",
        summary: "Working as a student host taught me communication, responsibility and how to create inclusive environments.",
        highlights: [],
        technologyIds: [],
    },
    {
        id: "red-cross-fundraiser",
        organization: "Norwegian Red Cross",
        role: "Fundraiser",
        startDate: "2023",
        endDate: "2023",
        summary: "Fundraising for the Norwegian Red Cross taught me direct dialogue and how to represent meaningful work.",
        highlights: [],
        technologyIds: [],
    },
    {
        id: "ntnu-university-projects",
        organization: "NTNU",
        role: "Hands-on university projects",
        startDate: "2023",
        endDate: "2026",
        summary: "Practical coursework at NTNU Trondheim gave me hands-on experience with full-stack development, APIs, databases, mobile apps and team-based software projects.",
        highlights: [],
        technologyIds: [],
    },
];
