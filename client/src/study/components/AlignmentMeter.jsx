export default function AlignmentMeter({ tier, score, label, explainer }) {
  return (
    <div className="study-align">
      <div className="study-align__top">
        <div>
          <p className="study-align__label">Response alignment score</p>
          <p className="study-align__headline">{label}</p>
        </div>
        <div className="study-align__score" aria-label={`Score ${score} out of 100`}>
          <span className="study-align__score-value">{score}</span>
          <span className="study-align__score-max">/ 100</span>
        </div>
      </div>
      <div className="study-align__track" aria-hidden="true">
        <div className={`study-align__fill study-align__fill--${tier}`} style={{ width: `${score}%` }} />
      </div>
      <p className="study-align__note">{explainer}</p>
    </div>
  );
}
