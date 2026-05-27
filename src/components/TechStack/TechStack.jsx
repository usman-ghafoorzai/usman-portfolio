import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
    FaCode,
    FaDatabase,
    FaDocker,
    FaGitAlt,
    FaHeartbeat,
    FaLayerGroup,
    FaMobileAlt,
    FaNodeJs,
    FaReact,
    FaTerminal,
} from "react-icons/fa";
import "./TechStack.css";

const scanCommand = "> run stack-scan --source cv --profile usman";

const stackGroups = [
    {
        status: "OK",
        title: "Frontend",
        description: "Interfaces, layouts and interactive user experiences.",
        icon: FaReact,
        accentRgb: "97, 218, 251",
        items: ["React", "JavaScript", "HTML", "CSS", "Vite"],
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

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 24,
        filter: "blur(8px)",
    },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.45,
            ease: "easeOut",
            delay: 0.16 + index * 0.1,
        },
    }),
};

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

export default function TechStack() {
    const sectionRef = useRef(null);

    const [hasStarted, setHasStarted] = useState(false);
    const [typedCommand, setTypedCommand] = useState("");
    const scanComplete = typedCommand.length === scanCommand.length;

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
        }, 28);

        return () => clearTimeout(timeoutId);
    }, [hasStarted, typedCommand]);

    return (
        <section ref={sectionRef} id="skills" className="tech-section">
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
                    A practical stack shaped by NTNU projects, health-tech bachelor work and
                    hands-on development — from frontend interfaces and mobile apps to backend
                    APIs, databases and integration work.
                </p>
            </motion.div>

            <div className="tech-layout">
                <motion.div
                    className="tech-terminal"
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
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
                            animate={scanComplete ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.75 }}
                        >
                            <div className="tech-progress-label">
                                <span>Technical profile scan</span>
                                <span>100%</span>
                            </div>

                            <motion.div
                                className="tech-progress-bar"
                                initial={{ scaleX: 0 }}
                                animate={scanComplete ? { scaleX: 1 } : { scaleX: 0 }}
                                transition={{ duration: 1.1, ease: "easeOut", delay: 0.85 }}
                            />
                        </motion.div>

                        <div className="tech-scan-list">
                            {stackGroups.map((group, index) => (
                                <motion.div
                                    key={group.title}
                                    className="tech-scan-row"
                                    style={{ "--tech-accent-rgb": group.accentRgb }}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={
                                        scanComplete
                                            ? { opacity: 1, x: 0 }
                                            : { opacity: 0, x: -12 }
                                    }
                                    transition={{
                                        duration: 0.35,
                                        ease: "easeOut",
                                        delay: 1 + index * 0.14,
                                    }}
                                >
                                    <span
                                        className={
                                            group.status === "ACTIVE"
                                                ? "tech-status tech-status--active"
                                                : "tech-status"
                                        }
                                    >
                                        [{group.status}]
                                    </span>
                                    <span>{group.title}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="tech-grid">
                    {stackGroups.map((group, index) => {
                        const Icon = group.icon;

                        return (
                            <motion.article
                                key={group.title}
                                className="tech-card"
                                style={{ "--tech-accent-rgb": group.accentRgb }}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                animate={scanComplete ? "visible" : "hidden"}
                                onMouseMove={handleTiltMove}
                                onMouseLeave={handleTiltLeave}
                            >
                                <div className="tech-card-glow" />

                                <div className="tech-card-header">
                                    <div className="tech-card-icon">
                                        <Icon />
                                    </div>

                                    <span
                                        className={
                                            group.status === "ACTIVE"
                                                ? "tech-card-status tech-card-status--active"
                                                : "tech-card-status"
                                        }
                                    >
                                        {group.status}
                                    </span>
                                </div>

                                <h3>{group.title}</h3>
                                <p>{group.description}</p>

                                <div className="tech-tags">
                                    {group.items.map((item) => (
                                        <span key={item}>{item}</span>
                                    ))}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>

            <FaDocker className="tech-background-icon tech-background-icon--one" />
            <FaCode className="tech-background-icon tech-background-icon--two" />
        </section>
    );
}