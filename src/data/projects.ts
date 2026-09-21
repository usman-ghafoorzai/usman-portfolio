import type { Project } from "../domain/project";
import type { LocalTechnologyId } from "./technologies";

type LocalProject = Omit<Project, "technologyIds"> & {
    readonly technologyIds: readonly LocalTechnologyId[];
};

export const projects = [
    {
        "id": "healthcare-interoperability-showcase",
        "slug": "healthcare-interoperability-showcase",
        "title": "Healthcare Interoperability Showcase",
        "label": "Featured bachelor showcase",
        "summary": "A public-safe showcase of a bachelor-level healthcare interoperability proof-of-concept, focused on API-based exchange between an external application and a simulated EHR environment.",
        "year": 2026,
        "status": "completed",
        "featured": true,
        "technologyIds": [
            "fhir",
            "openehr",
            "api-design",
            "docker",
            "postgresql",
            "architecture"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "integration",
                "priority": 1
            },
            {
                "capabilityId": "backend",
                "priority": 1
            },
            {
                "capabilityId": "databases",
                "priority": 1
            }
        ],
        "highlights": [
            "Designed around a clear integration boundary between application logic and interoperability concerns.",
            "Uses synthetic data and high-level FHIR/openEHR-oriented architecture descriptions.",
            "Documents privacy, publication boundaries, limitations and architecture tradeoffs honestly."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/healthcare-interoperability-showcase"
        }
    },
    {
        "id": "krisefikser",
        "slug": "krisefikser",
        "title": "Krisefikser",
        "label": "Agile full-stack team project",
        "summary": "A full-stack crisis-preparedness web application for Norwegian households, built as an NTNU agile team delivery with backend/frontend separation.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "java",
            "spring-boot",
            "vue-3",
            "typescript",
            "mysql",
            "websocket",
            "swagger"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "frontend",
                "priority": 1
            },
            {
                "capabilityId": "backend",
                "priority": 2
            },
            {
                "capabilityId": "workflow",
                "priority": 1
            }
        ],
        "highlights": [
            "Includes authentication, household coordination, emergency storage and map-based situational awareness.",
            "Combines REST workflows with real-time WebSocket/STOMP-based features.",
            "Demonstrates team-based agile development, testing, CI and formal project handover artifacts."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/idatt2106-2025-team10-prosjekt"
        }
    },
    {
        "id": "marketplace-fullstack",
        "slug": "marketplace-fullstack",
        "title": "Marketplace Full-Stack Project",
        "label": "Full-stack application",
        "summary": "A university full-stack marketplace application with user authentication, listings, images, bookmarks, reservations and API documentation.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "vue-3",
            "vite",
            "java-21",
            "spring-boot",
            "jwt",
            "mysql",
            "swagger"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "frontend",
                "priority": 2
            },
            {
                "capabilityId": "databases",
                "priority": 2
            },
            {
                "capabilityId": "workflow",
                "priority": 2
            }
        ],
        "highlights": [
            "Implements JWT-based login, item browsing, listing creation and reservation flows.",
            "Uses a separated frontend/backend structure with documented run and test commands.",
            "Includes Swagger UI and a concise security/privacy review for portfolio presentation."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/idatt2105-full-stack-project"
        }
    },
    {
        "id": "mobile-development",
        "slug": "mobile-development",
        "title": "Mobile Application Development",
        "label": "Mobile course portfolio",
        "summary": "A collection of Android/Kotlin assignments and a main Ionic React + TypeScript + Capacitor mobile app for todo/shopping-list workflows.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "kotlin",
            "android-sdk",
            "jetpack-compose",
            "ionic-react",
            "typescript",
            "capacitor"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "mobile",
                "priority": 1
            }
        ],
        "highlights": [
            "Main project includes multiple lists, item completion and local persistence through Capacitor Filesystem.",
            "Coursework covers Jetpack Compose, Room, DataStore, navigation, sockets and Android app structure.",
            "Shows practical experience across both native Android and hybrid mobile development."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/idatt2506-applikasjonsutvikling-for-mobile-enheter"
        }
    },
    {
        "id": "network-programming",
        "slug": "network-programming",
        "title": "Network Programming Coursework",
        "label": "Backend and networking",
        "summary": "Coursework archive covering Java networking assignments, socket/server exercises, a Spring Boot backend, a small frontend and WebSocket work.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "java",
            "sockets",
            "udp",
            "https",
            "spring-boot",
            "websocket"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "integration",
                "priority": 2
            }
        ],
        "highlights": [
            "Covers TCP, UDP, HTTPS, worker/event-loop patterns and WebSocket protocol handling.",
            "Includes a Spring Boot REST backend exercise and simple browser frontend using Fetch API.",
            "Useful as supporting evidence for backend, protocol and systems understanding."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/idatt2104-nettverksprogrammering"
        }
    },
    {
        "id": "algorithms-data-structures",
        "slug": "algorithms-data-structures",
        "title": "Algorithms and Data Structures",
        "label": "Core computer science",
        "summary": "Java coursework covering algorithms, data structures, reports and assignment implementations from IDATT2101 at NTNU.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "java",
            "algorithms",
            "graphs",
            "hashing",
            "dijkstra",
            "lzw"
        ],
        "capabilityEvidence": [],
        "highlights": [
            "Includes sorting, hashing, graph traversal, strongly connected components and Dijkstra shortest path.",
            "Contains LZW compression/decompression and runtime measurement/benchmarking exercises.",
            "Supports the practical problem-solving side behind backend and systems development."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/idatt2101-algoritmer-datastrukturer"
        }
    },
    {
        "id": "cpp-coursework",
        "slug": "cpp-coursework",
        "title": "C++ Coursework",
        "label": "Systems programming foundation",
        "summary": "A C++ coursework archive with practical exercises in language fundamentals, object-oriented programming, templates, GUI and networking.",
        "year": 2025,
        "status": "completed",
        "featured": false,
        "technologyIds": [
            "cpp",
            "stl",
            "templates",
            "cmake",
            "gtkmm",
            "boost-asio"
        ],
        "capabilityEvidence": [
            {
                "capabilityId": "systems",
                "priority": 1
            }
        ],
        "highlights": [
            "Covers pointers, references, classes, operator overloading, templates and STL usage.",
            "Includes basic GUI work with gtkmm and networking exercises with Boost.Asio.",
            "Shows lower-level programming exposure beyond web application development."
        ],
        "links": {
            "github": "https://github.com/usman-ghafoorzai/INFT2503-Cpp"
        }
    }
] as const satisfies readonly LocalProject[];

export type LocalProjectId = (typeof projects)[number]["id"];
