import { useEffect, useMemo, useState } from "react";
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
    "Newly graduated Computer Engineer from NTNU Trondheim.",
    "I like understanding how things work, why they break and how they can be made easier to use.",
    "For me, good software starts with understanding the problem, the workflow and the people around it.",
    "",
    "> beyond_code",
    "I care about building things people can actually use.",
    "That usually means solutions that make everyday work a little easier, clearer or more reliable.",
    "I like working close to real problems, not just isolated code.",
    "",
    "> background",
    "Practical coursework at NTNU Trondheim gave me hands-on experience with full-stack development, APIs, databases, mobile apps and team-based software projects.",
    "Working as a student host taught me communication, responsibility and how to create inclusive environments.",
    "Fundraising for the Norwegian Red Cross taught me direct dialogue and how to represent meaningful work.",
    "Technical lab work taught me structured data handling, quality assurance and careful process routines.",
    "",
    "> current_focus",
    "Backend, fullstack and integration work.",
    "I am especially interested in APIs, data flow and systems that connect real workflows.",
];

const codeLines = [
    "const developer = {",
    `  name: "${profile.name}",`,
    "  education: [",
    '    "Computer Engineering, System Development, NTNU Trondheim, 2023-2026",',
    '    "Industrial Chemistry and Biotechnology, NTNU Trondheim, 2020-2022"',
    "  ],",
    "  experience: [",
    '    "Technical lab assistant, Solor, 2017-2019",',
    '    "Student host, Sit Trondheim, 2020-2023",',
    '    "Fundraiser, Norwegian Red Cross, 2023,"',
    '    "Hands-on university projects, NTNU, 2023-2026"',
    "  ],",
    "  strengths: [",
    '    "Structured work",',
    '    "Clear communication",',
    '    "Analytical problem solving",',
    '    "Reliable under pressure"',
    "  ],",
    '  currentFocus: "Backend, fullstack, APIs and system integration",',
    `  availability: "${profile.availabilityStatus}"`,
    "};",
];

const TYPE_SPEED = 17;
const LINE_DELAY = 240;
const MOBILE_TYPE_SPEED = 11;
const MOBILE_LINE_DELAY = 170;
const MAX_TILT = 3;
const MOBILE_MEDIA_QUERY = "(max-width: 760px)";

const codeContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.35,
            staggerChildren: 0.06,
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

const CODE_PANEL_MIN_LINES = 24;

function getTerminalLineClassName(line) {
    if (line.startsWith(">")) {
        return "about-terminal-line about-terminal-command";
    }

    return "about-terminal-line";
}

export default function About() {
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({
        threshold: 0.28,
    });
    const { handleTiltMove, handleTiltLeave } = useTiltCard({ maxTilt: MAX_TILT });
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [typedLines, setTypedLines] = useState([]);
    const [hasFallbackStarted, setHasFallbackStarted] = useState(false);
    const [isMobileTyping, setIsMobileTyping] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    });
    const shouldStart = hasStarted || hasFallbackStarted;
    const paddedCodeLines = useMemo(() => {
        const fillerCount = Math.max(0, CODE_PANEL_MIN_LINES - codeLines.length);

        return [
            ...codeLines,
            ...Array.from({ length: fillerCount }, () => ""),
        ];
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setHasFallbackStarted(true);
        }, 1200);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const updateTypingMode = () => setIsMobileTyping(mediaQuery.matches);

        updateTypingMode();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", updateTypingMode);
            return () => mediaQuery.removeEventListener("change", updateTypingMode);
        }

        mediaQuery.addListener(updateTypingMode);
        return () => mediaQuery.removeListener(updateTypingMode);
    }, []);

    useEffect(() => {
        if (shouldStart && typedLines.length === 0) {
            setTypedLines([""]);
        }
    }, [shouldStart, typedLines.length]);

    useEffect(() => {
        if (!shouldStart) return;
        if (typedLines.length === 0) return;
        if (lineIndex >= terminalLines.length) return;
        const currentLine = terminalLines[lineIndex];
        const typeSpeed = isMobileTyping ? MOBILE_TYPE_SPEED : TYPE_SPEED;
        const lineDelay = isMobileTyping ? MOBILE_LINE_DELAY : LINE_DELAY;
        let timeoutId;

        if (charIndex <= currentLine.length) {
            timeoutId = setTimeout(() => {
                setTypedLines((currentLines) => {
                    const nextLines = [...currentLines];
                    nextLines[lineIndex] = currentLine.slice(0, charIndex);
                    return nextLines;
                });

                setCharIndex((currentIndex) => currentIndex + 1);
            }, charIndex === 0 ? lineDelay : typeSpeed);
        } else {
            timeoutId = setTimeout(() => {
                if (lineIndex < terminalLines.length - 1) {
                    setTypedLines((currentLines) => [...currentLines, ""]);
                }

                setLineIndex((currentIndex) => currentIndex + 1);
                setCharIndex(0);
            }, lineDelay);
        }

        return () => clearTimeout(timeoutId);
    }, [shouldStart, typedLines.length, lineIndex, charIndex, isMobileTyping]);

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
                    I care about understanding real workflows and building
                    practical solutions people can actually use every day.
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
                            <div className="about-terminal-body-reserve" aria-hidden="true">
                                {terminalLines.map((line, index) => (
                                    <div
                                        key={`reserve-${index}`}
                                        className={getTerminalLineClassName(line)}
                                    >
                                        {line}
                                        {index === terminalLines.length - 1 && (
                                            <span className="about-terminal-cursor">|</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="about-terminal-body-live">
                                {typedLines.map((line, index) => {
                                    const isLastLine = index === typedLines.length - 1;

                                    return (
                                        <div
                                            key={index}
                                            className={getTerminalLineClassName(line)}
                                        >
                                            {line}
                                            {isLastLine && shouldStart && (
                                                <span className="about-terminal-cursor">|</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
                            animate={shouldStart ? "visible" : "hidden"}
                        >
                            {paddedCodeLines.map((line, index) => (
                                <motion.div
                                    key={`${index}-${line}`}
                                    className="about-code-line"
                                    variants={codeLineVariants}
                                >
                                    <span className="about-line-number">{index + 1}</span>
                                    <span>{line || " "}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
