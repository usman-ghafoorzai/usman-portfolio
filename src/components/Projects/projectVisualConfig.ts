import type { Project } from "../../domain/project";

export const projectAccentRgbById = {
    "healthcare-interoperability-showcase": "192, 132, 252",
    "krisefikser": "104, 211, 145",
    "marketplace-fullstack": "97, 218, 251",
    "mobile-development": "45, 212, 191",
    "network-programming": "104, 211, 145",
    "algorithms-data-structures": "96, 165, 250",
    "cpp-coursework": "45, 212, 191"
} as const satisfies Record<Project["id"], string>;
