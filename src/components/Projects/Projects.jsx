import { useMemo } from "react";
import { motion } from "motion/react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import ExternalLink from "../common/ExternalLink";
import {
    ALL_STACK_ID,
    getStackLabel,
    isValidStackId,
} from "../../data/stacks";
import { projects } from "../../data/projects";
import { getProjectsForStack } from "../../utils/projectFilters";
import "./Projects.css";

const capsulePlacements = [
    { x: "0rem", y: "0rem", rotate: "-1.2deg" },
    { x: "0.7rem", y: "0.55rem", rotate: "1.3deg" },
    { x: "-0.55rem", y: "0.32rem", rotate: "-0.9deg" },
    { x: "0.9rem", y: "-0.3rem", rotate: "1.5deg" },
    { x: "-0.8rem", y: "0.62rem", rotate: "-1.4deg" },
    { x: "0.42rem", y: "-0.15rem", rotate: "0.8deg" },
    { x: "-0.35rem", y: "0.5rem", rotate: "-0.75deg" },
];

function getCapsuleStyle(index) {
    const placement = capsulePlacements[index % capsulePlacements.length];

    return {
        "--capsule-shift-x": placement.x,
        "--capsule-shift-y": placement.y,
        "--capsule-rotate": placement.rotate,
    };
}

function ProjectCard({
    project,
    index,
    style,
    activeStackLabel,
    isVisible = true,
}) {
    return (
        <article
            className={
                isVisible
                    ? "project-capsule"
                    : "project-capsule project-capsule--hidden"
            }
            style={style}
            data-evidence-scope={
                activeStackLabel === "All" ? "evidence" : activeStackLabel
            }
        >
            <div className="project-capsule-header">
                <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="project-year">{project.year}</span>
            </div>

            <span className="project-label">{project.label}</span>
            <h3>{project.title}</h3>

            <div className="project-tech-list">
                {project.tech.slice(0, 5).map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </div>

            <p className="project-summary">{project.summary}</p>

            <ExternalLink
                href={project.githubUrl}
                aria-label={`Open ${project.title} on GitHub`}
            >
                <FaGithub />
                <span>GitHub</span>
                <FaExternalLinkAlt className="project-link-arrow" />
            </ExternalLink>
        </article>
    );
}

export default function Projects({ activeStack = ALL_STACK_ID, onStackChange }) {
    const selectedStack = isValidStackId(activeStack) ? activeStack : ALL_STACK_ID;
    const selectedStackLabel = getStackLabel(selectedStack);
    const isShowingAll = selectedStack === ALL_STACK_ID;

    const activeAccentRgb = "255, 255, 255";

    const matchingProjects = useMemo(() => {
        return getProjectsForStack(projects, selectedStack);
    }, [selectedStack]);

    const matchingProjectIds = useMemo(() => {
        return new Set(matchingProjects.map((project) => project.id));
    }, [matchingProjects]);

    function handleShowAllClick() {
        onStackChange?.(ALL_STACK_ID);
    }

    return (
        <section
            id="projects"
            className="projects-section"
            style={{ "--projects-active-rgb": activeAccentRgb }}
        >
            <div className="projects-content">
                <motion.div
                    className="projects-header"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    <span className="projects-kicker">Project evidence</span>

                    <div className="projects-heading-row">
                        <div>
                            <h2 className="projects-title">Project evidence.</h2>
                            <p className="projects-intro">
                                Curated proof from selected projects. Choose a stack above to see
                                the strongest matching evidence.
                            </p>
                        </div>

                        <div
                            className={
                                isShowingAll
                                    ? "projects-terminal-status projects-terminal-status--all"
                                    : "projects-terminal-status"
                            }
                        >
                            <span className="projects-terminal-status-label">&gt; showing</span>
                            <strong>{selectedStackLabel}</strong>

                            {!isShowingAll && (
                                <button
                                    type="button"
                                    className="projects-show-all-button"
                                    onClick={handleShowAllClick}
                                >
                                    Show all
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={
                        isShowingAll
                            ? "projects-mosaic"
                            : "projects-mosaic projects-mosaic--filtered"
                    }
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {projects.map((project, index) => {
                        const isVisible =
                            isShowingAll || matchingProjectIds.has(project.id);

                        return (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                index={index}
                                activeStackLabel={selectedStackLabel}
                                isVisible={isVisible}
                                style={getCapsuleStyle(index)}
                            />
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
