import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import "./Navbar.css";

const SCROLL_THRESHOLD = 40;

const navItems = [
    { label: "Portfolio", href: "#home" },
    { label: "About me", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
];

const socialLinks = [
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/usman-ghafoorzai/",
        icon: FaLinkedinIn,
    },
    {
        label: "GitHub",
        href: "https://github.com/usman-ghafoorzai",
        icon: FaGithub,
    },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        }

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <header className="navbar-wrapper">
            <motion.nav
                className={`navbar ${isScrolled ? "navbar--compact" : ""}`}
                initial={{ opacity: 0, y: -18 }}
                animate={{
                    opacity: 1,
                    y: [0, -5, 0],
                }}
                transition={{
                    opacity: {
                        duration: 0.45,
                        ease: "easeOut",
                    },
                    y: {
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                }}
                aria-label="Main navigation"
            >
                <a href="#home" className="navbar-brand" aria-label="Go to home">
                    <span className="navbar-logo-mark">UG</span>
                    <span className="navbar-logo-text">Usman Ghafoorzai</span>
                </a>

                <div className="navbar-links">
                    {navItems.map((item) => (
                        <a key={item.href} href={item.href} className="navbar-link">
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="navbar-socials">
                    {socialLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className="navbar-social-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={item.label}
                                title={item.label}
                            >
                                <Icon />
                            </a>
                        );
                    })}
                </div>
            </motion.nav>
        </header>
    );
}