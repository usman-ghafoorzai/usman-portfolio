import { motion } from "motion/react";
import { FaEnvelope, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { profile } from "../../data/profile";
import ExternalLink from "../common/ExternalLink";
import "./Footer.css";

const footerLinks = [
    {
        label: "GitHub",
        href: profile.links.github,
        icon: FaGithub,
    },
    {
        label: "LinkedIn",
        href: profile.links.linkedin,
        icon: FaLinkedinIn,
    },
    {
        label: "Email",
        href: profile.links.email,
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
                        <p className="footer-name">{profile.name}</p>
                    </div>

                    <div className="footer-right">
                        <div className="footer-links">
                            {footerLinks.map((link) => {
                                const Icon = link.icon;
                                const isExternal = link.href.startsWith("http");

                                if (isExternal) {
                                    return (
                                        <ExternalLink
                                            key={link.label}
                                            href={link.href}
                                            className="footer-link"
                                        >
                                            <Icon />
                                            <span>{link.label}</span>
                                        </ExternalLink>
                                    );
                                }

                                return (
                                    <a key={link.label} href={link.href} className="footer-link">
                                        <Icon />
                                        <span>{link.label}</span>
                                    </a>
                                );
                            })}
                        </div>

                        <p className="footer-copy">(c) 2026 {profile.name}. All rights reserved.</p>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
