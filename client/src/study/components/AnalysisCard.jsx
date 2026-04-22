export function AnalysisCard({ title, subtitle, children, variant = "default" }) {
  return (
    <article className={`study-analysis-card study-analysis-card--${variant}`}>
      <header className="study-analysis-card__head">
        <h3 className="study-analysis-card__title">{title}</h3>
        {subtitle && <p className="study-analysis-card__sub">{subtitle}</p>}
      </header>
      <div className="study-analysis-card__body">{children}</div>
    </article>
  );
}
