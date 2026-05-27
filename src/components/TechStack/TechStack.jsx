import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
    FaCode,
    FaDatabase,
    FaDocker,
    FaGitAlt,
    FaLayerGroup,
    FaMobileAlt,
    FaNodeJs,
    FaReact,
    FaTerminal,
} from "react-icons/fa";
import TechStackBackground3D from "./TechStackBackground3D";
import "./TechStack.css";

const scanCommand = "> run stack-scan --source cv --profile usman";

const stackGroups = [
    {
        status: "OK",
        title: "Frontend",
        description: "Interfaces, layouts and interactive user experiences.",
        icon: FaReact,
        accentRgb: "97, 218, 251",
        items: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Vite"],
    },
    {
        status: "OK",
        title: "Backend",
        description: "APIs, server-side logic and structured application development.",
        icon: FaNodeJs,
        accentRgb: "104, 211, 145",
        items: ["Node.js", "NestJS", "Java", "REST APIs"],
    },
    {
        status: "OK",
        title: "Databases",
        description: "Data modeling, persistence and practical querying.",
        icon: FaDatabase,
        accentRgb: "96, 165, 250",
        items: ["PostgreSQL", "Prisma", "SQL"],
    },
    {
        status: "OK",
        title: "Integration",
        description: "Connecting systems through APIs, standards and structured data exchange.",
        icon: FaLayerGroup,
        accentRgb: "192, 132, 252",
        items: ["FHIR", "openEHR", "API Design", "Docker"],
    },
    {
        status: "OK",
        title: "Systems & Mobile",
        description: "Experience from study projects with lower-level and mobile development.",
        icon: FaMobileAlt,
        accentRgb: "45, 212, 191",
        items: ["C++", "Kotlin", "Mobile Apps", "Java"],
    },
    {
        status: "ACTIVE",
        title: "Workflow",
        description: "How I build, test, document and collaborate on software projects.",
        icon: FaGitAlt,
        accentRgb: "251, 146, 60",
        items: ["Git", "GitHub", "Swagger", "Jest", "Agile"],
    },
];

const MAX_TILT = 7;
const COMMAND_TYPE_SPEED = 28;
const STATUS_TYPE_SPEED = 58;
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

export default function TechStack() {
    const sectionRef = useRef(null);

    const [hasStarted, setHasStarted] = useState(false);
    const [typedCommand, setTypedCommand] = useState("");
    const [scanProgress, setScanProgress] = useState(0);

    const commandComplete = typedCommand.length === scanCommand.length;
    const scanProgressPercent = Math.round(scanProgress * 100);

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
            { threshold: 0.28 },
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
                                            <div
                                                key={group.title}
                                                className={`tech-scan-row tech-scan-row--${cardState}`}
                                                style={getRowStyle(index)}
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

                                                <span>{group.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="tech-grid">
                        {stackGroups.map((group, index) => {
                            const Icon = group.icon;
                            const cardState = getCardState(index);

                            return (
                                <article
                                    key={group.title}
                                    className={`tech-card tech-card--${cardState}`}
                                    style={getCardStyle(group, index)}
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

                                    <h3>{group.title}</h3>
                                    <p>{group.description}</p>

                                    <div className="tech-tags">
                                        {group.items.map((item) => (
                                            <span key={item}>{item}</span>
                                        ))}
                                    </div>
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