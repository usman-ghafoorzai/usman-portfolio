import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IoChevronDown } from "react-icons/io5";
import "./Hero.css";

const ROTATION_INTERVAL = 2200;

const rotatingWords = [
    "Backend Developer",
    "API Builder",
    "System Integrator",
    "Full-Stack Developer",
    "FHIR / openEHR Explorer",
    "Runtime Debugger",
    "It works at runtime. Suspicious.",
];

export default function Hero() {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setWordIndex((currentIndex) => {
                return (currentIndex + 1) % rotatingWords.length;
            });
        }, ROTATION_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    function scrollToNextSection() {
        const aboutSection = document.getElementById("about");

        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            return;
        }

        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
        });
    }

    return (
        <section id="home" className="hero-section">
            <div className="hero-background" />

            <div className="hero-content">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={rotatingWords[wordIndex]}
                        className="hero-rotating-word"
                        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                        {rotatingWords[wordIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>

            <motion.button
                className="hero-scroll-button"
                type="button"
                aria-label="Scroll to next section"
                onClick={scrollToNextSection}
                animate={{ y: [0, 9, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
            >
                <IoChevronDown />
            </motion.button>
        </section>
    );
}