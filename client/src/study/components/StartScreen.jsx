export default function StartScreen({ onStart, loading, error }) {
  return (
    <div className="study-start study-screen study-screen--enter">
      <div className="study-start__card">
        <p className="study-eyebrow">Research session</p>
        <h1 className="study-start__title">Sentiment Alignment Study</h1>
        <p className="study-start__lead">
          You will read a single realistic scenario, then chat with an AI assistant as you reflect on how you feel and
          what you might do next. Your goal is not to persuade the model, but to express your perspective naturally so we
          can study how emotional signals and assistant responses line up.
        </p>
        <p className="study-start__note">
          You will receive <strong>one scenario</strong> and <strong>five minutes</strong> to respond. When the timer
          ends, the session advances automatically to a structured reflection screen.
        </p>
        {error && <div className="study-banner study-banner--error">{error}</div>}
        <div className="study-start__actions">
          <button type="button" className="study-btn study-btn--primary study-btn--lg" onClick={onStart} disabled={loading}>
            {loading ? "Preparing session…" : "Start Survey"}
          </button>
        </div>
        <aside className="study-start__secondary" aria-label="Participant information">
          <h2 className="study-start__secondary-title">Consent &amp; comfort</h2>
          <p>
            Participation is voluntary. You may skip any question on the final debrief. Responses are used for research
            on human–AI emotional alignment. This interface is not a crisis service—if you are in distress, please reach
            out to a trusted professional or local emergency resource.
          </p>
        </aside>
      </div>
    </div>
  );
}
