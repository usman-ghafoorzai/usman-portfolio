import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaCode, FaTerminal } from "react-icons/fa";
import { profile } from "../../data/profile";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import { useTiltCard } from "../../hooks/useTiltCard";
import "./About.css";

const terminalLines = [
    "> whoami",
    profile.name,
    "",
    "> cat story.txt",
    "Newly Computer Engineering graduate from NTNU.",
    "I enjoy turning messy problems into structured, working systems.",
    "",
    "> beyond_code",
    "Curious by nature. Practical by mindset.",
    "I like collaborating, learning fast and building things people can actually use.",
    "",
    "> current_focus",
    "Backend, fullstack and integration work — especially where data, APIs and real workflows meet.",
];

const codeLines = [
    "const developer = {",
    `  name: "${profile.name}",`,
    '  profile: "Curious, hard-working and practical",',
    '  strengths: ["Fast learner", "Structured thinker", "Reliable teammate"],',
    '  workStyle: "Comfortable working solo, but I enjoy building with a team",',
    `  availability: "${profile.availabilityStatus}",`,
    '  mindset: "Think clearly, ship consistently, improve relentlessly."',
    "};",
];

const TYPE_SPEED = 22;
const LINE_DELAY = 240;
const MAX_TILT = 3;

const codeContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.35,
            staggerChildren: 0.09,
        },
    },
};

const codeLineVariants = {
    hidden: {
        opacity: 0,
        x: 18,
        filter: "blur(4px)",
    },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.38,
            ease: "easeOut",
        },
    },
};

export default function About() {
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({
        threshold: 0.28,
    });
    const { handleTiltMove, handleTiltLeave } = useTiltCard({ maxTilt: MAX_TILT });
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
        <section ref={sectionRef} id="about" className="about-section">
            <motion.div
                className="about-header"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
            >
                <span className="about-kicker">About me</span>
                <h2 className="about-title">More than just code.</h2>
                <p className="about-intro">
                    I care about understanding the problem behind the code — how people work,
                    how systems connect, and how small technical decisions can make a product
                    easier to use, maintain and trust.
                </p>
            </motion.div>

            <div className="about-grid">
                <motion.div
                    className="about-card-motion"
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div
                        className="about-terminal about-tilt-card"
                        onMouseMove={handleTiltMove}
                        onMouseLeave={handleTiltLeave}
                    >
                        <div className="about-window-top">
                            <div className="about-window-dots">
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className="about-window-title">
                                <FaTerminal />
                                <span>profile.sh</span>
                            </div>
                        </div>

                        <div className="about-terminal-body">
                            {typedLines.map((line, index) => {
                                const isCommand = line.startsWith(">");
                                const isLastLine = index === typedLines.length - 1;

                                return (
                                    <div
                                        key={index}
                                        className={
                                            isCommand
                                                ? "about-terminal-line about-terminal-command"
                                                : "about-terminal-line"
                                        }
                                    >
                                        {line}
                                        {isLastLine && hasStarted && (
                                            <span className="about-terminal-cursor">
                                                |
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="about-card-motion"
                    initial={{ opacity: 0, x: 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
                >
                    <div
                        className="about-code about-tilt-card"
                        onMouseMove={handleTiltMove}
                        onMouseLeave={handleTiltLeave}
                    >
                        <div className="about-window-top">
                            <div className="about-window-dots">
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className="about-window-title">
                                <FaCode />
                                <span>developer.js</span>
                            </div>
                        </div>

                        <motion.div
                            className="about-code-body"
                            variants={codeContainerVariants}
                            initial="hidden"
                            animate={hasStarted ? "visible" : "hidden"}
                        >
                            {codeLines.map((line, index) => (
                                <motion.div
                                    key={line}
                                    className="about-code-line"
                                    variants={codeLineVariants}
                                >
                                    <span className="about-line-number">{index + 1}</span>
                                    <span>{line}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
