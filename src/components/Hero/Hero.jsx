import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IoChevronDown } from "react-icons/io5";
import "./Hero.css";

const ROTATION_INTERVAL = 2200;
const TYPE_SPEED = 80;
const DELETE_SPEED = 25;
const HOLD_DELAY = 1200;

const rotatingWords = [
    "Backend Developer",
    "Frontend Developer",
    "Computer Engineer",
    "Full-Stack Developer",
    "Software Graduate",
    "Open for Contract Work",
];

export default function Hero() {
    const [wordIndex, setWordIndex] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = rotatingWords[wordIndex];

        let timeoutId;

        if (!isDeleting && typedText.length < currentWord.length) {
            timeoutId = setTimeout(() => {
                setTypedText(currentWord.slice(0, typedText.length + 1));
            }, TYPE_SPEED);
        }

        if (!isDeleting && typedText.length === currentWord.length) {
            timeoutId = setTimeout(() => {
                setIsDeleting(true);
            }, HOLD_DELAY);
        }

        if (isDeleting && typedText.length > 0) {
            timeoutId = setTimeout(() => {
                setTypedText(currentWord.slice(0, typedText.length - 1));
            }, DELETE_SPEED);
        }

        if (isDeleting && typedText.length === 0) {
            setIsDeleting(false);
            setWordIndex((currentIndex) => {
                return (currentIndex + 1) % rotatingWords.length;
            });
        }

        return () => clearTimeout(timeoutId);
    }, [typedText, isDeleting, wordIndex]);

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
                <motion.span
                    className="hero-rotating-word"
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                >
                    {typedText}
                    <span aria-hidden="true">|</span>
                </motion.span>
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