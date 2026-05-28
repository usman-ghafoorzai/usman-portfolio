import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import TechStack from "./components/TechStack/TechStack";
import Projects from "./components/Projects/Projects";
import CurrentWork from "./components/CurrentWork/CurrentWork";
import Footer from "./components/Footer/Footer";
import { ALL_STACK_ID } from "./data/stacks";
import "./index.css";

export default function App() {
    const [activeProjectStack, setActiveProjectStack] = useState(ALL_STACK_ID);

    function handleStackSelect(stackId) {
        setActiveProjectStack(stackId);

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
            <CurrentWork />
            <Footer />
        </main>
    );
}
