import { motion } from "motion/react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import "./Navbar.css";

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
    return (
        <header className="navbar-wrapper">
            <motion.nav
                className="navbar"
                initial={{ opacity: 0, y: -18 }}
                animate={{
                    opacity: 1,
                    y: [0, -5, 0],
                }}
                transition={{
                    opacity: {
                        duration: 1.5,
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
                <a href="#home" className="navbar-logo">
                    Usman G.
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