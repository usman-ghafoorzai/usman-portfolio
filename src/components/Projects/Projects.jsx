import { useMemo } from "react";
import { motion } from "motion/react";
import {
    FaDatabase,
    FaExternalLinkAlt,
    FaGithub,
    FaLayerGroup,
    FaMobileAlt,
    FaNodeJs,
    FaReact,
    FaTools,
} from "react-icons/fa";
import {
    ALL_STACK_ID,
    getStackAccentRgb,
    getStackLabel,
    isValidStackId,
} from "../../data/stacks";
import { projects } from "../../data/projects";
import {
    getProjectsForStack,
    splitFeaturedProject,
} from "../../utils/projectFilters";
import "./Projects.css";

const projectIconMap = {
    integration: FaLayerGroup,
    tools: FaTools,
    react: FaReact,
    mobile: FaMobileAlt,
    backend: FaNodeJs,
    database: FaDatabase,
};

const MAX_TILT = 9;

function handleTiltMove(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * MAX_TILT * 2;
    const rotateX = -((y / rect.height) - 0.5) * MAX_TILT * 2;

    card.style.setProperty("--project-tilt-x", `${rotateX}deg`);
    card.style.setProperty("--project-tilt-y", `${rotateY}deg`);
    card.style.setProperty("--project-glow-x", `${x}px`);
    card.style.setProperty("--project-glow-y", `${y}px`);
}

function handleTiltLeave(event) {
    const card = event.currentTarget;

    card.style.setProperty("--project-tilt-x", "0deg");
    card.style.setProperty("--project-tilt-y", "0deg");
    card.style.setProperty("--project-glow-x", "50%");
    card.style.setProperty("--project-glow-y", "50%");
}

function ProjectCard({ project, activeStackLabel, featured = false }) {
    const Icon = projectIconMap[project.iconKey] ?? FaTools;

    return (
        <article
            className={featured ? "project-card project-card--featured" : "project-card"}
            style={{ "--project-accent-rgb": "var(--projects-active-rgb)" }}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
        >
            <div className="project-card-loader" aria-hidden="true" />

            <div className="project-card-header">
                <div className="project-icon">
                    <Icon />
                </div>

                <div className="project-meta">
                    <span>{project.label}</span>
                    <strong>{project.year}</strong>
                </div>
            </div>

            <h3>{project.title}</h3>
            <p>{project.summary}</p>

            <div className="project-evidence">
                <span className="project-evidence-label">Evidence</span>

                <ul>
                    {project.evidence.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>

            <div className="project-tech-list">
                {project.tech.map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </div>

            <div className="project-card-footer">
                <span className="project-match-label">
                    {activeStackLabel === "All"
                        ? "Portfolio evidence"
                        : `Matches ${activeStackLabel}`}
                </span>

                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${project.title} on GitHub`}
                >
                    <FaGithub />
                    <span>GitHub</span>
                    <FaExternalLinkAlt className="project-link-arrow" />
                </a>
            </div>
        </article>
    );
}

export default function Projects({ activeStack = ALL_STACK_ID, onStackChange }) {
    const selectedStack = isValidStackId(activeStack) ? activeStack : ALL_STACK_ID;
    const selectedStackLabel = getStackLabel(selectedStack);
    const isShowingAll = selectedStack === ALL_STACK_ID;

    const activeAccentRgb = isShowingAll
        ? "255, 255, 255"
        : getStackAccentRgb(selectedStack);

    const visibleProjects = useMemo(() => {
        return getProjectsForStack(projects, selectedStack);
    }, [selectedStack]);

    const { featuredProject, secondaryProjects } = useMemo(() => {
        return splitFeaturedProject(visibleProjects);
    }, [visibleProjects]);

    function handleShowAllClick() {
        onStackChange?.(ALL_STACK_ID);
    }

    return (
        <section
            id="projects"
            className={
                isShowingAll
                    ? "projects-section"
                    : "projects-section projects-section--stack-active"
            }
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
                    <span className="projects-kicker">Selected work</span>

                    <div className="projects-heading-row">
                        <div>
                            <h2 className="projects-title">Project evidence.</h2>
                            <p className="projects-intro">
                                Curated project evidence connected to the stack selected above.
                                Each project links technical skills to concrete work from NTNU
                                projects, health-tech integration, full-stack development, mobile
                                work and systems-oriented coursework.
                            </p>
                        </div>

                        <div className="projects-terminal-status">
                            <span>&gt; showing</span>
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

                <div className="projects-layout">
                    {featuredProject && (
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.55, ease: "easeOut" }}
                        >
                            <ProjectCard
                                project={featuredProject}
                                activeStackLabel={selectedStackLabel}
                                featured
                            />
                        </motion.div>
                    )}

                    <motion.div
                        className="projects-grid"
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                    >
                        {secondaryProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                activeStackLabel={selectedStackLabel}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}