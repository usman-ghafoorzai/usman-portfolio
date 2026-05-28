import { motion } from "motion/react";
import { FaEnvelope, FaGithub, FaLinkedinIn } from "react-icons/fa";
import "./Footer.css";

const footerLinks = [
    {
        label: "GitHub",
        href: "https://github.com/usman-ghafoorzai",
        icon: FaGithub,
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/usman-ghafoorzai/",
        icon: FaLinkedinIn,
    },
    {
        label: "Email",
        href: "mailto:usmangha@hotmail.com",
        icon: FaEnvelope,
    },
];

export default function Footer() {
    return (
        <footer id="contact" className="footer-section">
            <motion.div
                className="footer-content"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className="footer-main">
                    <div className="footer-left">
                        <p className="footer-name">Usman Ghafoorzai</p>
                    </div>

                    <div className="footer-right">
                        <div className="footer-links">
                            {footerLinks.map((link) => {
                                const Icon = link.icon;

                                return (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="footer-link"
                                        target={link.href.startsWith("http") ? "_blank" : undefined}
                                        rel={
                                            link.href.startsWith("http")
                                                ? "noopener noreferrer"
                                                : undefined
                                        }
                                    >
                                        <Icon />
                                        <span>{link.label}</span>
                                    </a>
                                );
                            })}
                        </div>

                        <p className="footer-copy">(c) 2026 Usman Ghafoorzai. All rights reserved.</p>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
