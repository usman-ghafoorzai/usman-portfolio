import Navbar from "./components/Navbar/Navbar.jsx";
import "./index.css";

export default function App() {
  return (
      <main className="page">
        <Navbar />

        <section id="home" className="section">
          <div className="container">
            <p className="eyebrow">Portfolio</p>

            <h1 className="heading-xl">
              Building clean backend systems, APIs and full-stack applications
            </h1>

            <p className="body-text">
              Computer engineering graduate focused on practical software
              development, system integration, REST APIs, databases and scalable
              application architecture.
            </p>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
              <a href="#contact" className="button">
                Contact me
              </a>

              <a href="#projects" className="button button-ghost">
                View projects
              </a>
            </div>
          </div>
        </section>
      </main>
  );
}