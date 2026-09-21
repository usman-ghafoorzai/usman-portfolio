import { useMemo } from "react";
import { motion } from "motion/react";
import { FaTerminal } from "react-icons/fa";
import { usePortfolioContent } from "../../app/providers/portfolio-content-context";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import { useTerminalTypewriter } from "../../hooks/useTerminalTypewriter";
import "./CurrentWork.css";

function createTerminalLines(profile) {
    return [
        "> currently_working_on",
        "Portfolio v2",
        "",
        "> build_log",
        "Building a polished developer portfolio with interactive project evidence,",
        "smooth technical UI and a clearer link between skills, projects and real work.",
        "",
        "> status",
        `${profile.availabilityStatus}.`,
        "",
        "> exploring_client_work",
        "Website concept for Cherrygloss Oslo, a beauty and nail salon in Oslo",
        "Early conversations around a clean, modern site for services, booking flow and visual brand presence.",
        "",
        "> focus",
        "Mobile-first layout, clear service presentation and a polished brand experience.",
    ];
}

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
    const { profile } = usePortfolioContent();
    const terminalLines = useMemo(() => createTerminalLines(profile), [profile]);
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({
        threshold: 0.35,
    });
    const typedLines = useTerminalTypewriter({
        lines: terminalLines,
        isActive: hasStarted,
        typeSpeed: TYPE_SPEED,
        lineDelay: LINE_DELAY,
    });

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
