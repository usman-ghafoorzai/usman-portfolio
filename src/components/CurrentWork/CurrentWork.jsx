import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaTerminal } from "react-icons/fa";
import { profile } from "../../data/profile";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import "./CurrentWork.css";

const terminalLines = [
    "> currently_working_on",
    "Portfolio v2",
    "",
    "> build_log",
    "Building a polished developer portfolio with interactive project evidence,",
    "smooth technical UI and a clearer link between skills, projects and real work.",
    "",
    "> status",
    `${profile.availabilityStatus}.`,
];

const TYPE_SPEED = 22;
const LINE_DELAY = 240;
const MAX_TILT = 4;

function handleTiltMove(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * MAX_TILT * 2;
    const rotateX = -((y / rect.height) - 0.5) * MAX_TILT * 2;

    card.style.setProperty("--work-tilt-x", `${rotateX}deg`);
    card.style.setProperty("--work-tilt-y", `${rotateY}deg`);
    card.style.setProperty("--work-glow-x", `${x}px`);
    card.style.setProperty("--work-glow-y", `${y}px`);
}

function handleTiltLeave(event) {
    const card = event.currentTarget;

    card.style.setProperty("--work-tilt-x", "0deg");
    card.style.setProperty("--work-tilt-y", "0deg");
    card.style.setProperty("--work-glow-x", "50%");
    card.style.setProperty("--work-glow-y", "50%");
}

export default function CurrentWork() {
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({
        threshold: 0.35,
    });
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [typedLines, setTypedLines] = useState([]);

    useEffect(() => {
        if (hasStarted && typedLines.length === 0) {
            setTypedLines([""]);
        }
    }, [hasStarted, typedLines.length]);

    useEffect(() => {
        if (!hasStarted) return;
        if (typedLines.length === 0) return;
        if (lineIndex >= terminalLines.length) return;
        const currentLine = terminalLines[lineIndex];
        let timeoutId;

        if (charIndex <= currentLine.length) {
            timeoutId = setTimeout(() => {
                setTypedLines((currentLines) => {
                    const nextLines = [...currentLines];
                    nextLines[lineIndex] = currentLine.slice(0, charIndex);
                    return nextLines;
                });

                setCharIndex((currentIndex) => currentIndex + 1);
            }, charIndex === 0 ? LINE_DELAY : TYPE_SPEED);
        } else {
            timeoutId = setTimeout(() => {
                if (lineIndex < terminalLines.length - 1) {
                    setTypedLines((currentLines) => [...currentLines, ""]);
                }

                setLineIndex((currentIndex) => currentIndex + 1);
                setCharIndex(0);
            }, LINE_DELAY);
        }

        return () => clearTimeout(timeoutId);
    }, [hasStarted, typedLines.length, lineIndex, charIndex]);

    return (
        <section ref={sectionRef} id="current-work" className="current-work-section">
            <div className="current-work-content">
                <motion.div
                    className="current-work-card-shell"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    <article
                        className="current-work-terminal"
                        onMouseMove={handleTiltMove}
                        onMouseLeave={handleTiltLeave}
                    >
                        <div className="current-work-window-top">
                            <div className="current-work-window-dots">
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className="current-work-window-title">
                                <FaTerminal />
                                <span>current-work.sh</span>
                            </div>
                        </div>

                        <div className="current-work-terminal-body">
                            {typedLines.map((line, index) => {
                                const isCommand = line.startsWith(">");
                                const isLastLine = index === typedLines.length - 1;

                                return (
                                    <div
                                        key={index}
                                        className={
                                            isCommand
                                                ? "current-work-terminal-line current-work-terminal-command"
                                                : "current-work-terminal-line"
                                        }
                                    >
                                        {line}
                                        {isLastLine && hasStarted && (
                                            <span className="current-work-cursor">|</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                </motion.div>
            </div>
        </section>
    );
}
