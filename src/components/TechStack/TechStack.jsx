import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
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
    FaTerminal,
} from "react-icons/fa";
import {
    SiDocker,
    SiGit,
    SiJest,
    SiKotlin,
    SiNestjs,
    SiPostgresql,
    SiPrisma,
    SiSwagger,
    SiTypescript,
    SiVite,
} from "react-icons/si";
import { TbBrandCpp } from "react-icons/tb";
import { stackGroups } from "../../data/stacks";
import TechStackBackground3D from "./TechStackBackground3D";
import "./TechStack.css";

const scanCommand = "> run stack-scan --source cv --profile usman";
const selectPrompt = "> pick one stack to inspect project evidence";

const stackIconMap = {
    react: FaReact,
    node: FaNodeJs,
    database: FaDatabase,
    integration: FaLayerGroup,
    mobile: FaMobileAlt,
    workflow: FaGitAlt,
};

const techItemIconMap = {
    react: FaReact,
    javascript: FaJs,
    typescript: SiTypescript,
    html: FaHtml5,
    css: FaCss3Alt,
    vite: SiVite,

    node: FaNodeJs,
    nestjs: SiNestjs,
    java: FaJava,
    api: FaServer,

    postgresql: SiPostgresql,
    prisma: SiPrisma,
    database: FaDatabase,

    healthcare: FaLayerGroup,
    docker: SiDocker,

    cpp: TbBrandCpp,
    kotlin: SiKotlin,
    mobile: FaMobileAlt,

    git: SiGit,
    github: FaGithub,
    swagger: SiSwagger,
    jest: SiJest,
    agile: FaGitAlt,
};

const MAX_TILT = 7;
const COMMAND_TYPE_SPEED = 28;
const STATUS_TYPE_SPEED = 58;
const SELECT_PROMPT_TYPE_SPEED = 32;
const SCAN_DURATION_MS = 9200;
const STATUS_START_THRESHOLD = 0.1;

function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}

function easeOutCubic(value) {
    const clampedValue = clamp(value);
    return 1 - Math.pow(1 - clampedValue, 3);
}

function handleTiltMove(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * MAX_TILT * 2;
    const rotateX = -((y / rect.height) - 0.5) * MAX_TILT * 2;

    card.style.setProperty("--tilt-rotate-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-rotate-y", `${rotateY}deg`);
    card.style.setProperty("--tilt-glow-x", `${x}px`);
    card.style.setProperty("--tilt-glow-y", `${y}px`);
}

function handleTiltLeave(event) {
    const card = event.currentTarget;

    card.style.setProperty("--tilt-rotate-x", "0deg");
    card.style.setProperty("--tilt-rotate-y", "0deg");
    card.style.setProperty("--tilt-glow-x", "50%");
    card.style.setProperty("--tilt-glow-y", "50%");
}

function TypedStatus({ text, isActive }) {
    const [typedText, setTypedText] = useState("");

    useEffect(() => {
        if (!isActive) {
            setTypedText("");
        }
    }, [isActive, text]);

    useEffect(() => {
        if (!isActive) return;
        if (typedText.length >= text.length) return;

        const timeoutId = setTimeout(() => {
            setTypedText(text.slice(0, typedText.length + 1));
        }, STATUS_TYPE_SPEED);

        return () => clearTimeout(timeoutId);
    }, [isActive, text, typedText]);

    return (
        <>
            {typedText}
            {isActive && typedText.length < text.length && (
                <span className="tech-status-cursor">|</span>
            )}
        </>
    );
}

export default function TechStack({ onStackSelect }) {
    const sectionRef = useRef(null);

    const [hasStarted, setHasStarted] = useState(false);
    const [typedCommand, setTypedCommand] = useState("");
    const [typedSelectPrompt, setTypedSelectPrompt] = useState("");
    const [scanProgress, setScanProgress] = useState(0);

    const commandComplete = typedCommand.length === scanCommand.length;
    const scanProgressPercent = Math.round(scanProgress * 100);
    const selectionReady = scanProgress >= 1;
    const isThreeJSDisabled = import.meta.env.VITE_DISABLE_THREEJS === "true";

    function getCardProgress(index) {
        if (!commandComplete) return 0;

        const totalCards = stackGroups.length;
        const start = index / totalCards;
        const end = (index + 1) / totalCards;
        const localProgress = (scanProgress - start) / (end - start);

        return clamp(localProgress);
    }

    function getCardState(index) {
        const cardProgress = getCardProgress(index);

        if (!commandComplete || cardProgress <= 0) return "pending";
        if (cardProgress >= 1) return "ready";

        return "loading";
    }

    function getCardStyle(group, index) {
        const cardProgress = getCardProgress(index);
        const easedProgress = easeOutCubic(cardProgress);

        return {
            "--tech-accent-rgb": group.accentRgb,
            "--card-progress": cardProgress.toFixed(4),
            "--card-opacity": (0.44 + easedProgress * 0.56).toFixed(4),
            "--card-blur": `${(1 - easedProgress) * 1.35}px`,
            "--card-loader-opacity": cardProgress > 0 && cardProgress < 1 ? "1" : "0",
        };
    }

    function getRowStyle(index) {
        const cardProgress = getCardProgress(index);
        const easedProgress = easeOutCubic(cardProgress);

        return {
            "--row-opacity": (0.42 + easedProgress * 0.58).toFixed(4),
        };
    }

    function handleStackSelect(stackId) {
        if (!selectionReady) return;
        onStackSelect?.(stackId);
    }

    function handleStackKeyDown(event, stackId) {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        handleStackSelect(stackId);
    }

    useEffect(() => {
        const sectionElement = sectionRef.current;

        if (!sectionElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.28 }
        );

        observer.observe(sectionElement);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        if (typedCommand.length >= scanCommand.length) return;

        const timeoutId = setTimeout(() => {
            setTypedCommand(scanCommand.slice(0, typedCommand.length + 1));
        }, COMMAND_TYPE_SPEED);

        return () => clearTimeout(timeoutId);
    }, [hasStarted, typedCommand]);

    useEffect(() => {
        if (!commandComplete) return;

        let animationFrameId;
        const startTime = performance.now();

        function updateProgress(currentTime) {
            const elapsedTime = currentTime - startTime;
            const nextProgress = clamp(elapsedTime / SCAN_DURATION_MS);

            setScanProgress(nextProgress);

            if (nextProgress < 1) {
                animationFrameId = requestAnimationFrame(updateProgress);
            }
        }

        setScanProgress(0);
        animationFrameId = requestAnimationFrame(updateProgress);

        return () => cancelAnimationFrame(animationFrameId);
    }, [commandComplete]);

    useEffect(() => {
        if (!selectionReady) {
            setTypedSelectPrompt("");
            return;
        }

        if (typedSelectPrompt.length >= selectPrompt.length) return;

        const timeoutId = setTimeout(() => {
            setTypedSelectPrompt(selectPrompt.slice(0, typedSelectPrompt.length + 1));
        }, SELECT_PROMPT_TYPE_SPEED);

        return () => clearTimeout(timeoutId);
    }, [selectionReady, typedSelectPrompt]);

    return (
        <section ref={sectionRef} id="skills" className="tech-section">
            <div className="tech-content">
                <motion.div
                    className="tech-header"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    <span className="tech-kicker">Tech stack</span>
                    <h2 className="tech-title">Systems I can build with.</h2>
                    <p className="tech-intro">
                        A practical stack shaped by NTNU projects, health-tech bachelor work
                        and hands-on development — from frontend interfaces and mobile apps
                        to backend APIs, databases and integration work.
                    </p>
                </motion.div>

                <div className="tech-layout">
                    {!isThreeJSDisabled && (
                        <div className="tech-layout-blob-layer" aria-hidden="true">
                            <TechStackBackground3D />
                        </div>
                    )}

                    <motion.div
                        className="tech-terminal-shell"
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div
                            className="tech-terminal tech-tilt-card"
                            onMouseMove={handleTiltMove}
                            onMouseLeave={handleTiltLeave}
                        >
                            <div className="tech-window-top">
                                <div className="tech-window-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className="tech-window-title">
                                    <FaTerminal />
                                    <span>stack-scan.sh</span>
                                </div>
                            </div>

                            <div className="tech-terminal-body">
                                <div className="tech-command-line">
                                    {typedCommand}
                                    {hasStarted && typedCommand.length < scanCommand.length && (
                                        <span className="tech-cursor">|</span>
                                    )}
                                </div>

                                <motion.div
                                    className="tech-progress-shell"
                                    initial={{ opacity: 0 }}
                                    animate={commandComplete ? { opacity: 1 } : { opacity: 0 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <div className="tech-progress-label">
                                        <span>Technical profile scan</span>
                                        <span>{scanProgressPercent}%</span>
                                    </div>

                                    <div
                                        className="tech-progress-bar"
                                        style={{
                                            "--scan-progress": scanProgress.toFixed(4),
                                        }}
                                    />
                                </motion.div>

                                <div className="tech-scan-list">
                                    {stackGroups.map((group, index) => {
                                        const cardProgress = getCardProgress(index);
                                        const cardState = getCardState(index);
                                        const statusIsActive =
                                            cardProgress > STATUS_START_THRESHOLD ||
                                            cardState === "ready";

                                        return (
                                            <button
                                                key={group.id}
                                                type="button"
                                                className={`tech-scan-row tech-scan-row--${cardState}`}
                                                style={getRowStyle(index)}
                                                disabled={!selectionReady}
                                                onClick={() => handleStackSelect(group.id)}
                                            >
                                                <span
                                                    className={
                                                        group.status === "ACTIVE"
                                                            ? "tech-status tech-status--active"
                                                            : "tech-status"
                                                    }
                                                >
                                                    <TypedStatus
                                                        text={`[${group.status}]`}
                                                        isActive={statusIsActive}
                                                    />
                                                </span>

                                                <span>{group.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <motion.div
                                    className="tech-select-line"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={
                                        selectionReady
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 8 }
                                    }
                                    transition={{ duration: 0.35 }}
                                >
                                    {typedSelectPrompt}
                                    {selectionReady && <span className="tech-cursor">|</span>}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="tech-grid">
                        {stackGroups.map((group, index) => {
                            const Icon = stackIconMap[group.iconKey] ?? FaCode;
                            const cardState = getCardState(index);

                            return (
                                <article
                                    key={group.id}
                                    className={`tech-card tech-card--${cardState} ${
                                        selectionReady ? "tech-card--selectable" : ""
                                    }`}
                                    style={getCardStyle(group, index)}
                                    role="button"
                                    tabIndex={selectionReady ? 0 : -1}
                                    aria-disabled={!selectionReady}
                                    aria-label={`View projects related to ${group.label}`}
                                    onClick={() => handleStackSelect(group.id)}
                                    onKeyDown={(event) => handleStackKeyDown(event, group.id)}
                                    onMouseMove={handleTiltMove}
                                    onMouseLeave={handleTiltLeave}
                                >
                                    <div className="tech-card-loader" aria-hidden="true">
                                        <span />
                                    </div>

                                    <div className="tech-card-header">
                                        <div className="tech-card-icon">
                                            <Icon />
                                        </div>
                                    </div>

                                    <h3>{group.label}</h3>
                                    <p>{group.description}</p>

                                    <div className="tech-tags">
                                        {group.items.map((item) => {
                                            const ItemIcon =
                                                techItemIconMap[item.iconKey] ?? FaCode;

                                            return (
                                                <span key={item.label}>
                                                    <ItemIcon
                                                        className="tech-tag-icon"
                                                        aria-hidden="true"
                                                    />
                                                    {item.label}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <span className="tech-card-action">
                                        View related projects
                                    </span>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <FaDocker className="tech-background-icon tech-background-icon--one" />
                <FaCode className="tech-background-icon tech-background-icon--two" />
            </div>
        </section>
    );
}