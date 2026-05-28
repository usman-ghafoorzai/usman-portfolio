import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FaTerminal } from "react-icons/fa";
import "./CurrentWork.css";

const commandLine = "> Currently working on";
const TYPE_SPEED = 48;
const REVEAL_DELAY = 260;
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
    const sectionRef = useRef(null);

    const [hasStarted, setHasStarted] = useState(false);
    const [typedCommand, setTypedCommand] = useState("");
    const [showDetails, setShowDetails] = useState(false);

    const commandComplete = typedCommand.length === commandLine.length;

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
            {
                threshold: 0.35,
            },
        );

        observer.observe(sectionElement);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        if (typedCommand.length >= commandLine.length) return;

        const timeoutId = setTimeout(() => {
            setTypedCommand(commandLine.slice(0, typedCommand.length + 1));
        }, TYPE_SPEED);

        return () => clearTimeout(timeoutId);
    }, [hasStarted, typedCommand]);

    useEffect(() => {
        if (!commandComplete) {
            setShowDetails(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            setShowDetails(true);
        }, REVEAL_DELAY);

        return () => clearTimeout(timeoutId);
    }, [commandComplete]);

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
                            <div className="current-work-command-line">
                                {typedCommand}
                                {hasStarted && (
                                    <span className="current-work-cursor">|</span>
                                )}
                            </div>

                            <motion.div
                                className="current-work-active-panel"
                                initial={false}
                                animate={
                                    showDetails
                                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                                        : { opacity: 0, y: 8, filter: "blur(3px)" }
                                }
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <div className="current-work-active-row">
                                    <span className="current-work-badge">[OK]</span>
                                    <h3>Portfolio v2</h3>
                                </div>

                                <p>
                                    Building a polished developer portfolio with interactive
                                    project evidence, smooth technical UI and a clearer link
                                    between skills, projects and real work.
                                </p>

                                <div className="current-work-status-line">
                                    <span>status:</span>
                                    <strong>
                                        open to junior roles, projects and contract work
                                    </strong>
                                </div>
                            </motion.div>
                        </div>
                    </article>
                </motion.div>
            </div>
        </section>
    );
}
