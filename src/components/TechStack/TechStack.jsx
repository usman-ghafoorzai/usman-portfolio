import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FaCode, FaDocker } from "react-icons/fa";
import { stackGroups } from "../../data/stacks";
import { usePortfolioContent } from "../../app/providers/portfolio-content-context";
import { clamp } from "../../utils/math";
import { useInViewOnce } from "../../hooks/useInViewOnce";
import { useTiltCard } from "../../hooks/useTiltCard";
import TechStackBackground3D from "./TechStackBackground3D";
import TechStackTerminal from "./TechStackTerminal";
import TechStackCloud from "./TechStackCloud";
import "./TechStack.css";

const scanCommand = "> run stack-scan --source cv --profile usman";
const selectPrompt = "> pick one stack to inspect project evidence";

const MAX_TILT = 7;
const COMMAND_TYPE_SPEED = 28;
const SELECT_PROMPT_TYPE_SPEED = 32;
const SCAN_DURATION_MS = 7200;

export default function TechStack({ onStackSelect }) {
    const { technologies } = usePortfolioContent();
    const floatingTechItems = useMemo(() => {
        const technologyLabels = new Map(
            technologies.map((technology) => [technology.id, technology.label]),
        );
        return stackGroups.flatMap((group, groupIndex) =>
            group.items.map((item, itemIndex) => {
                const label = technologyLabels.get(item.technologyId) ?? item.technologyId;
                const iconKey = item.iconKey;
                const stackId = item.stackId ?? group.id;

                return {
                    label,
                    iconKey,
                    groupId: group.id,
                    stackId,
                    groupLabel: group.label,
                    groupIndex,
                    itemIndex,
                    accentRgb: group.accentRgb,
                };
            })
        );
    }, [technologies]);
    const { ref: sectionRef, hasEnteredView: hasStarted } = useInViewOnce({ threshold: 0.28 });
    const { handleTiltMove, handleTiltLeave } = useTiltCard({ maxTilt: MAX_TILT });

    const [typedCommand, setTypedCommand] = useState("");
    const [typedSelectPrompt, setTypedSelectPrompt] = useState("");
    const [scanProgress, setScanProgress] = useState(0);
    const [isMobileBlobLayout, setIsMobileBlobLayout] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 980px)").matches;
    });

    const commandComplete = typedCommand.length === scanCommand.length;
    const selectionReady = scanProgress >= 1;
    const isThreeJSDisabled = import.meta.env.VITE_DISABLE_THREEJS === "true";

    function handleStackSelect(stackId) {
        if (!selectionReady) return;
        onStackSelect?.(stackId);
    }

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const mediaQuery = window.matchMedia("(max-width: 980px)");

        const updateMobileState = () => {
            setIsMobileBlobLayout(mediaQuery.matches);
        };

        updateMobileState();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", updateMobileState);

            return () => mediaQuery.removeEventListener("change", updateMobileState);
        }

        mediaQuery.addListener(updateMobileState);

        return () => mediaQuery.removeListener(updateMobileState);
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

        animationFrameId = requestAnimationFrame(updateProgress);

        return () => cancelAnimationFrame(animationFrameId);
    }, [commandComplete]);

    useEffect(() => {
        if (!selectionReady) return;

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
                        <div
                            className={`tech-layout-blob-layer ${
                                isMobileBlobLayout ? "tech-layout-blob-layer--mobile" : ""
                            }`}
                            aria-hidden="true"
                        >
                            <TechStackBackground3D mobileMode={isMobileBlobLayout} />
                        </div>
                    )}

                    <TechStackTerminal
                        hasStarted={hasStarted}
                        typedCommand={typedCommand}
                        commandComplete={commandComplete}
                        scanProgress={scanProgress}
                        selectionReady={selectionReady}
                        typedSelectPrompt={typedSelectPrompt}
                        onStackSelect={handleStackSelect}
                        handleTiltMove={handleTiltMove}
                        handleTiltLeave={handleTiltLeave}
                    />
                    <TechStackCloud
                        items={floatingTechItems}
                        commandComplete={commandComplete}
                        scanProgress={scanProgress}
                        selectionReady={selectionReady}
                        onStackSelect={handleStackSelect}
                    />
                </div>

                <FaDocker className="tech-background-icon tech-background-icon--one" />
                <FaCode className="tech-background-icon tech-background-icon--two" />
            </div>
        </section>
    );
}
