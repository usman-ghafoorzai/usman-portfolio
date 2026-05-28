import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
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
    FaTerminal,
} from "react-icons/fa";
import { stackGroups } from "../../data/stacks";
import { clamp, easeOutCubic } from "../../utils/math";
import { useTypewriter } from "../../hooks/useTypewriter";
import TechStackBackground3D from "./TechStackBackground3D";
import { floatingTechPlacements } from "./techStackVisualConfig";
import "./TechStack.css";

const scanCommand = "> run stack-scan --source cv --profile usman";
const selectPrompt = "> pick one stack to inspect project evidence";

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

const floatingTechItems = stackGroups.flatMap((group, groupIndex) =>
    group.items.map((item, itemIndex) => {
        const label = typeof item === "string" ? item : item.label;
        const iconKey =
            typeof item === "string"
                ? label.toLowerCase().replaceAll(" ", "-")
                : item.iconKey;

        return {
            label,
            iconKey,
            groupId: group.id,
            groupLabel: group.label,
            groupIndex,
            itemIndex,
            accentRgb: group.accentRgb,
        };
    })
);

const MAX_TILT = 7;
const COMMAND_TYPE_SPEED = 28;
const STATUS_TYPE_SPEED = 58;
const SELECT_PROMPT_TYPE_SPEED = 32;
const SCAN_DURATION_MS = 9200;
const STATUS_START_THRESHOLD = 0.1;

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
    const typedText = useTypewriter({
        text,
        isActive,
        speed: STATUS_TYPE_SPEED,
    });

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

    function getRowStyle(index) {
        const cardProgress = getCardProgress(index);
        const easedProgress = easeOutCubic(cardProgress);

        return {
            "--row-opacity": (0.42 + easedProgress * 0.58).toFixed(4),
        };
    }

    function getTokenStyle(item, index) {
        const placement =
            floatingTechPlacements[index % floatingTechPlacements.length];

        const groupProgress = getCardProgress(item.groupIndex);
        const staggerOffset = item.itemIndex * 0.08;
        const localProgress = clamp(
            (groupProgress - staggerOffset) / (1 - Math.min(staggerOffset, 0.72))
        );
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

                    <div className="tech-cloud-field" aria-label="Technology cloud">
                        {floatingTechItems.map((item, index) => {
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
                                    onClick={() => handleStackSelect(item.groupId)}
                                    onKeyDown={(event) => handleStackKeyDown(event, item.groupId)}
                                    aria-label={`View projects related to ${item.groupLabel}`}
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
                </div>

                <FaDocker className="tech-background-icon tech-background-icon--one" />
                <FaCode className="tech-background-icon tech-background-icon--two" />
            </div>
        </section>
    );
}
