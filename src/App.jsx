import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import TechStack from "./components/TechStack/TechStack";
import Projects from "./components/Projects/Projects";
import "./index.css";

export default function App() {
    const [activeProjectStack, setActiveProjectStack] = useState("All");

    function handleStackSelect(stackName) {
        setActiveProjectStack(stackName);

        window.requestAnimationFrame(() => {
            document.getElementById("projects")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    }

    return (
        <main className="page">
            <Navbar />
            <Hero />
            <About />
            <TechStack onStackSelect={handleStackSelect} />
            <Projects
                activeStack={activeProjectStack}
                onStackChange={setActiveProjectStack}
            />
        </main>
    );
}