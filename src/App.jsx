import "./index.css";

export default function App() {
  return (
      <main className="page">
        <section className="section">
          <div className="container">
            <p className="eyebrow">Portfolio</p>

            <h1 className="heading-xl">
              Your go-to engineer for Next.js projects
            </h1>

            <p className="body-text">
              Bringing ideas to life with clean, efficient and scalable code.
              Whether it is building web apps, optimizing performance, or solving
              technical challenges.
            </p>

            <div className="mt-6 flex gap-3">
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