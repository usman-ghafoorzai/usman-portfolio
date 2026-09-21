import type { SiteContent } from "../domain/site-content";

export const siteContent: SiteContent = {
    hero: {
        roles: [
            "Backend Developer",
            "Frontend Developer",
            "Computer Engineer",
            "Full-Stack Developer",
            "Software Graduate",
            "Open for Contract Work",
        ],
    },
    about: {
        label: "About me",
        heading: "More than just code.",
        intro: "I care about understanding real workflows and building practical solutions people can actually use every day.",
        story: [
            "Newly graduated Computer Engineer from NTNU Trondheim.",
            "I like understanding how things work, why they break and how they can be made easier to use.",
            "For me, good software starts with understanding the problem, the workflow and the people around it.",
        ],
        beyondCode: [
            "I care about building things people can actually use.",
            "That usually means solutions that make everyday work a little easier, clearer or more reliable.",
            "I like working close to real problems, not just isolated code.",
        ],
        currentFocus: [
            "Backend, fullstack and integration work.",
            "I am especially interested in APIs, data flow and systems that connect real workflows.",
        ],
        currentFocusSummary: "Backend, fullstack, APIs and system integration",
        strengths: [
            "Structured work",
            "Clear communication",
            "Analytical problem solving",
            "Reliable under pressure",
        ],
        education: [
            {
                id: "ntnu-computer-engineering",
                institution: "NTNU Trondheim",
                program: "Computer Engineering, System Development",
                startYear: 2023,
                endYear: 2026,
            },
            {
                id: "ntnu-industrial-chemistry",
                institution: "NTNU Trondheim",
                program: "Industrial Chemistry and Biotechnology",
                startYear: 2020,
                endYear: 2022,
            },
        ],
    },
    currentWork: {
        primaryWork: "Portfolio v2",
        buildLog: [
            "Building a polished developer portfolio with interactive project evidence,",
            "smooth technical UI and a clearer link between skills, projects and real work.",
        ],
        clientWork: [
            "Website concept for Cherrygloss Oslo, a beauty and nail salon in Oslo",
            "Early conversations around a clean, modern site for services, booking flow and visual brand presence.",
        ],
        focus: [
            "Mobile-first layout, clear service presentation and a polished brand experience.",
        ],
    },
};
