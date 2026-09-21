import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FaCode, FaTerminal } from "react-icons/fa";
import { usePortfolioContent } from "../../app/providers/portfolio-content-context";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import { useTiltCard } from "../../hooks/useTiltCard";
import { useTerminalTypewriter } from "../../hooks/useTerminalTypewriter";
import "./About.css";

function createTerminalLines(profile, about, experiences) {
    return [
        "> whoami",
        profile.name,
        "",
        "> cat story.txt",
        ...about.story,
        "",
        "> beyond_code",
        ...about.beyondCode,
        "",
        "> background",
        ...[...experiences].sort((a, b) =>
            (b.endDate ?? "9999").localeCompare(a.endDate ?? "9999")
            || a.startDate.localeCompare(b.startDate),
        ).map(experience => experience.summary),
        "",
        "> current_focus",
        ...about.currentFocus,
    ];
}

function quotedArrayLines(values) {
    return values.map((value, index) =>
        `    ${JSON.stringify(value)}${index < values.length - 1 ? "," : ""}`,
    );
}

function createCodeLines(profile, about, experiences) {
    return [
        "const developer = {",
        `  name: ${JSON.stringify(profile.name)},`,
        "  education: [",
        ...quotedArrayLines(about.education.map(entry =>
            `${entry.program}, ${entry.institution}, ${entry.startYear}-${entry.endYear}`,
        )),
        "  ],",
        "  experience: [",
        ...quotedArrayLines(experiences.map(experience => {
            const startYear = experience.startDate.slice(0, 4);
            const endYear = experience.endDate?.slice(0, 4) ?? "Present";
            const dates = startYear === endYear ? startYear : `${startYear}-${endYear}`;
            return `${experience.role}, ${experience.organization}, ${dates}`;
        })),
        "  ],",
        "  strengths: [",
        ...quotedArrayLines(about.strengths),
        "  ],",
        `  currentFocus: ${JSON.stringify(about.currentFocusSummary)},`,
        `  availability: ${JSON.stringify(profile.availabilityStatus)}`,
        "};",
    ];
}

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
    const { profile, siteContent, experiences } = usePortfolioContent();
    const { about } = siteContent;
    const terminalLines = useMemo(() => createTerminalLines(profile, about, experiences), [profile, about, experiences]);
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({
        threshold: 0.28,
    });
    const { handleTiltMove, handleTiltLeave } = useTiltCard({ maxTilt: MAX_TILT });
    const [hasFallbackStarted, setHasFallbackStarted] = useState(false);
    const [isMobileTyping, setIsMobileTyping] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    });
    const shouldStart = hasStarted || hasFallbackStarted;
    const typeSpeed = isMobileTyping ? MOBILE_TYPE_SPEED : TYPE_SPEED;
    const lineDelay = isMobileTyping ? MOBILE_LINE_DELAY : LINE_DELAY;
    const typedLines = useTerminalTypewriter({
        lines: terminalLines,
        isActive: shouldStart,
        typeSpeed,
        lineDelay,
    });
    const paddedCodeLines = useMemo(() => {
        const codeLines = createCodeLines(profile, about, experiences);
        const fillerCount = Math.max(0, CODE_PANEL_MIN_LINES - codeLines.length);

        return [
            ...codeLines,
            ...Array.from({ length: fillerCount }, () => ""),
        ];
    }, [profile, about, experiences]);

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

    return (
        <section ref={sectionRef} id="about" className="about-section">
            <motion.div
                className="about-header"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
            >
                <span className="about-kicker">{about.label}</span>
                <h2 className="about-title">{about.heading}</h2>
                <p className="about-intro">
                    {about.intro}
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
