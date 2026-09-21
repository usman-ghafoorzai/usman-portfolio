import {
    FaBolt,
    FaCode,
    FaCss3Alt,
    FaDatabase,
    FaDocker,
    FaGitAlt,
    FaGithub,
    FaHtml5,
    FaJava,
    FaJs,
    FaLayerGroup,
    FaMobileAlt,
    FaNodeJs,
    FaReact,
    FaServer,
} from "react-icons/fa";
import { stackGroups } from "../../data/stacks";
import { easeOutCubic } from "../../utils/math";
import { getStackCardProgress, getTokenRevealProgress } from "./techStackProgress";
import { floatingTechPlacements } from "./techStackVisualConfig";

const techItemIconMap = {
    react: FaReact,
    javascript: FaJs,
    html: FaHtml5,
    css: FaCss3Alt,
    vite: FaBolt,

    node: FaNodeJs,
    java: FaJava,
    api: FaServer,

    database: FaDatabase,
    healthcare: FaLayerGroup,
    docker: FaDocker,

    mobile: FaMobileAlt,

    git: FaGitAlt,
    github: FaGithub,
    agile: FaGitAlt,
};

const techItemTextIconMap = {
    typescript: "TS",
    nestjs: "N",
    postgresql: "PG",
    prisma: "P",
    cpp: "C++",
    kotlin: "K",
    swagger: "SW",
    jest: "J",
};

export default function TechStackCloud({
    items,
    commandComplete,
    scanProgress,
    selectionReady,
    onStackSelect,
}) {
    function getTokenStyle(item, index) {
        const placement =
            floatingTechPlacements[index % floatingTechPlacements.length];

        const groupProgress = getStackCardProgress(
            commandComplete, scanProgress, item.groupIndex, stackGroups.length,
        );
        const localProgress = getTokenRevealProgress(groupProgress, item.itemIndex);
        const easedProgress = easeOutCubic(localProgress);

        return {
            "--tech-accent-rgb": item.accentRgb,
            "--token-x": placement.x,
            "--token-y": placement.y,
            "--token-rotate": placement.rotate,
            "--token-delay": placement.delay,
            "--token-opacity": (0.12 + easedProgress * 0.74).toFixed(4),
            "--token-blur": `${(1 - easedProgress) * 1.05}px`,
            "--token-scale": (0.95 + easedProgress * 0.17).toFixed(4),
        };
    }

    function handleStackKeyDown(event, stackId) {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        onStackSelect(stackId);
    }

    return (
        <div className="tech-cloud-field" aria-label="Technology cloud">
            {items.map((item, index) => {
                const ItemIcon = techItemIconMap[item.iconKey] ?? FaCode;
                const textIcon = techItemTextIconMap[item.iconKey];

                return (
                    <button
                        key={`${item.groupId}-${item.label}`}
                        type="button"
                        className={`tech-cloud-token ${
                            selectionReady ? "tech-cloud-token--selectable" : ""
                        }`}
                        style={getTokenStyle(item, index)}
                        disabled={!selectionReady}
                        onClick={() => onStackSelect(item.stackId)}
                        onKeyDown={(event) => handleStackKeyDown(event, item.stackId)}
                        aria-label={`View projects related to ${item.label}`}
                    >
                        {textIcon ? (
                            <span className="tech-cloud-text-icon">
                                {textIcon}
                            </span>
                        ) : (
                            <ItemIcon
                                className="tech-cloud-icon"
                                aria-hidden="true"
                            />
                        )}

                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
