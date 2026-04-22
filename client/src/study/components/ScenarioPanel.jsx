export default function ScenarioPanel({ scenario }) {
  if (!scenario) return null;
  return (
    <section className="study-scenario-panel" aria-labelledby="scenario-title">
      <p className="study-eyebrow">Assigned scenario</p>
      <h2 id="scenario-title" className="study-scenario-panel__title">
        {scenario.title}
      </h2>
      <p className="study-scenario-panel__desc">{scenario.description}</p>
    </section>
  );
}
