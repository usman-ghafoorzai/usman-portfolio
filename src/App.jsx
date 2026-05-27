import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import "./index.css";

export default function App() {
  return (
      <main className="page">
        <Navbar />
        <Hero />
          <About />

        <section id="about" className="section">
          <div className="container">
            <p className="eyebrow">About me</p>
            <h2 className="heading-lg">More content coming here.</h2>
          </div>
        </section>
      </main>
  );
}