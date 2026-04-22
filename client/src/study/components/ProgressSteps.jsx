const STEPS = [
  { id: 1, label: "Introduction" },
  { id: 2, label: "Live scenario" },
  { id: 3, label: "Reflection" },
];

export default function ProgressSteps({ activeStep }) {
  return (
    <nav className="study-progress" aria-label="Study progress">
      <ol className="study-progress__list">
        {STEPS.map((s) => {
          const state = s.id === activeStep ? "current" : s.id < activeStep ? "done" : "upcoming";
          return (
            <li key={s.id} className={`study-progress__item study-progress__item--${state}`}>
              <span className="study-progress__index" aria-hidden="true">
                {s.id}
              </span>
              <span className="study-progress__label">{s.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
