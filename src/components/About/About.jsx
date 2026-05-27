import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaCode, FaTerminal } from "react-icons/fa";
import "./About.css";

const terminalLines = [
    "> whoami",
    "Usman Ghafoorzai",
    "",
    "> cat profile.txt",
    "Computer Engineering student from NTNU.",
    "Focused on backend, fullstack, APIs and system integration.",
    "",
    "> current_focus",
    "Building practical systems that connect users, data and workflows.",
];

const codeLines = [
    "const developer = {",
    '  name: "Usman Ghafoorzai",',
    '  role: "Computer Engineer",',
    '  focus: ["Backend", "Fullstack", "APIs"],',
    '  tools: ["React", "Node.js", "Docker", "PostgreSQL"],',
    '  mindset: "Build clean, useful and practical systems."',
    "};",
];

export default function About() {
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [typedLines, setTypedLines] = useState([""]);

    useEffect(() => {
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
            }, charIndex === 0 ? 280 : 22);
        } else {
            timeoutId = setTimeout(() => {
                if (lineIndex < terminalLines.length - 1) {
                    setTypedLines((currentLines) => [...currentLines, ""]);
                }

                setLineIndex((currentIndex) => currentIndex + 1);
                setCharIndex(0);
            }, 240);
        }

        return () => clearTimeout(timeoutId);
    }, [lineIndex, charIndex]);

    return (
        <section id="about" className="about-section">
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
                    I like building systems that are structured, practical and useful —
                    from APIs and databases to fullstack applications and integrations.
                </p>
            </motion.div>

            <div className="about-grid">
                <motion.div
                    className="about-terminal"
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
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
                        {typedLines.map((line, index) => (
                            <div
                                key={`${line}-${index}`}
                                className={
                                    line.startsWith(">")
                                        ? "about-terminal-line about-terminal-command"
                                        : "about-terminal-line"
                                }
                            >
                                {line}
                                {index === typedLines.length - 1 &&
                                    lineIndex < terminalLines.length && (
                                        <span className="about-terminal-cursor">|</span>
                                    )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="about-code"
                    initial={{ opacity: 0, x: 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
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

                    <div className="about-code-body">
                        {codeLines.map((line, index) => (
                            <div key={line} className="about-code-line">
                                <span className="about-line-number">{index + 1}</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}