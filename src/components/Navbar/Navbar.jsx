import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    FaBriefcase,
    FaEnvelope,
    FaFolderOpen,
    FaGithub,
    FaHome,
    FaLinkedinIn,
    FaUser,
} from "react-icons/fa";
import "./Navbar.css";

const navItems = [
    { label: "Home", href: "#home", icon: FaHome },
    { label: "About", href: "#about", icon: FaUser },
    { label: "Projects", href: "#projects", icon: FaFolderOpen },
    { label: "Skills", href: "#skills", icon: FaBriefcase },
    { label: "Contact", href: "#contact", icon: FaEnvelope },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 70);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="navbar-wrapper">
            <motion.nav
                className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                aria-label="Main navigation"
            >
                <a href="#home" className="navbar-brand" aria-label="Go to home">
                    <span className="navbar-brand-mark">UG</span>
                    <span className="navbar-brand-name">Usman Ghafoorzai</span>
                </a>

                <div className="navbar-actions">
                    <div className="navbar-links">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <a key={item.href} href={item.href} className="navbar-link">
                                    <Icon className="navbar-link-icon" aria-hidden="true" />
                                    <span>{item.label}</span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="navbar-socials">
                        <a
                            href="https://github.com/usman-ghafoorzai"
                            className="navbar-icon-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                        >
                            <FaGithub />
                        </a>

                        <a
                            href="https://www.linkedin.com/in/usman-ghafoorzai/"
                            className="navbar-icon-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedinIn />
                        </a>
                    </div>
                </div>
            </motion.nav>
        </header>
    );
}