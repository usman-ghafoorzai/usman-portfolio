import { motion } from "motion/react";
import { FaTerminal } from "react-icons/fa";
import { stackGroups } from "../../data/stacks";
import { useTypewriter } from "../../hooks/useTypewriter";
import { easeOutCubic } from "../../utils/math";
import { getStackCardProgress, getStackCardState } from "./techStackProgress";

const STATUS_TYPE_SPEED = 58;
const STATUS_START_THRESHOLD = 0.1;

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

export default function TechStackTerminal({
    hasStarted,
    typedCommand,
    commandComplete,
    scanProgress,
    selectionReady,
    typedSelectPrompt,
    onStackSelect,
    handleTiltMove,
    handleTiltLeave,
}) {
    const scanProgressPercent = Math.round(scanProgress * 100);

    function getCardProgress(index) {
        return getStackCardProgress(commandComplete, scanProgress, index, stackGroups.length);
    }

    function getRowStyle(index) {
        const cardProgress = getCardProgress(index);
        const easedProgress = easeOutCubic(cardProgress);

        return {
            "--row-opacity": (0.42 + easedProgress * 0.58).toFixed(4),
        };
    }

    return (
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
                        {hasStarted && !commandComplete && (
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
                            const cardState = getStackCardState(commandComplete, cardProgress);
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
                                    onClick={() => onStackSelect(group.id)}
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
    );
}
