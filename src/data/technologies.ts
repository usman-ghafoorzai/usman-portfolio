import type { Technology } from "../domain/technology";

export const technologiesById = {
    "react": {
        "id": "react",
        "label": "React"
    },
    "javascript": {
        "id": "javascript",
        "label": "JavaScript"
    },
    "typescript": {
        "id": "typescript",
        "label": "TypeScript"
    },
    "html": {
        "id": "html",
        "label": "HTML"
    },
    "css": {
        "id": "css",
        "label": "CSS"
    },
    "vite": {
        "id": "vite",
        "label": "Vite"
    },
    "nodejs": {
        "id": "nodejs",
        "label": "Node.js"
    },
    "nestjs": {
        "id": "nestjs",
        "label": "NestJS"
    },
    "java": {
        "id": "java",
        "label": "Java"
    },
    "rest-apis": {
        "id": "rest-apis",
        "label": "REST APIs"
    },
    "postgresql": {
        "id": "postgresql",
        "label": "PostgreSQL"
    },
    "prisma": {
        "id": "prisma",
        "label": "Prisma"
    },
    "sql": {
        "id": "sql",
        "label": "SQL"
    },
    "fhir": {
        "id": "fhir",
        "label": "FHIR"
    },
    "openehr": {
        "id": "openehr",
        "label": "openEHR"
    },
    "api-design": {
        "id": "api-design",
        "label": "API Design"
    },
    "docker": {
        "id": "docker",
        "label": "Docker"
    },
    "cpp": {
        "id": "cpp",
        "label": "C++"
    },
    "kotlin": {
        "id": "kotlin",
        "label": "Kotlin"
    },
    "mobile-apps": {
        "id": "mobile-apps",
        "label": "Mobile Apps"
    },
    "git": {
        "id": "git",
        "label": "Git"
    },
    "github": {
        "id": "github",
        "label": "GitHub"
    },
    "swagger": {
        "id": "swagger",
        "label": "Swagger"
    },
    "jest": {
        "id": "jest",
        "label": "Jest"
    },
    "agile": {
        "id": "agile",
        "label": "Agile"
    },
    "architecture": {
        "id": "architecture",
        "label": "Architecture"
    },
    "spring-boot": {
        "id": "spring-boot",
        "label": "Spring Boot"
    },
    "vue-3": {
        "id": "vue-3",
        "label": "Vue 3"
    },
    "mysql": {
        "id": "mysql",
        "label": "MySQL"
    },
    "websocket": {
        "id": "websocket",
        "label": "WebSocket"
    },
    "java-21": {
        "id": "java-21",
        "label": "Java 21"
    },
    "jwt": {
        "id": "jwt",
        "label": "JWT"
    },
    "android-sdk": {
        "id": "android-sdk",
        "label": "Android SDK"
    },
    "jetpack-compose": {
        "id": "jetpack-compose",
        "label": "Jetpack Compose"
    },
    "ionic-react": {
        "id": "ionic-react",
        "label": "Ionic React"
    },
    "capacitor": {
        "id": "capacitor",
        "label": "Capacitor"
    },
    "sockets": {
        "id": "sockets",
        "label": "Sockets"
    },
    "udp": {
        "id": "udp",
        "label": "UDP"
    },
    "https": {
        "id": "https",
        "label": "HTTPS"
    },
    "algorithms": {
        "id": "algorithms",
        "label": "Algorithms"
    },
    "graphs": {
        "id": "graphs",
        "label": "Graphs"
    },
    "hashing": {
        "id": "hashing",
        "label": "Hashing"
    },
    "dijkstra": {
        "id": "dijkstra",
        "label": "Dijkstra"
    },
    "lzw": {
        "id": "lzw",
        "label": "LZW"
    },
    "stl": {
        "id": "stl",
        "label": "STL"
    },
    "templates": {
        "id": "templates",
        "label": "Templates"
    },
    "cmake": {
        "id": "cmake",
        "label": "CMake"
    },
    "gtkmm": {
        "id": "gtkmm",
        "label": "gtkmm"
    },
    "boost-asio": {
        "id": "boost-asio",
        "label": "Boost.Asio"
    }
} as const satisfies Record<string, Technology>;

export type LocalTechnologyId = keyof typeof technologiesById;

export const technologies = Object.values(technologiesById);

export function getTechnologyLabel(id: string): string {
    return technologies.find((technology) => technology.id === id)?.label ?? id;
}
