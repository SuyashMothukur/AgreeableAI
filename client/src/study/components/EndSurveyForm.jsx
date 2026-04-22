import { useState } from "react";

const initial = {
  howSupported: 3,
  aiAgreed: "Mixed",
  aiChallenged: "Slightly",
  howSatisfied: 3,
  feedback: "",
};

export default function EndSurveyForm({ onSubmit, submitting, error, onBack, canSubmit = true, onRestart }) {
  const [survey, setSurvey] = useState(initial);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(survey);
  }

  return (
    <div className="study-end study-screen study-screen--enter">
      <div className="study-end__layout">
        <header className="study-end__head">
          <p className="study-eyebrow">Debrief</p>
          <h1 className="study-end__title">End survey</h1>
          <p className="study-end__lede">
            A few quick items help us interpret the session. There are no wrong answers—choose what feels closest.
          </p>
        </header>
        <form className="study-end__form" onSubmit={handleSubmit}>
          {!canSubmit && (
            <div className="study-banner study-banner--error" style={{ marginBottom: "1rem" }}>
              <p style={{ margin: "0 0 0.75rem" }}>
                The study server requires at least one chat message before you can submit. If the timer ended before you
                sent anything, restart below and run the timed session again.
              </p>
              {onRestart && (
                <button type="button" className="study-btn study-btn--primary" onClick={onRestart}>
                  Restart study session
                </button>
              )}
            </div>
          )}
          <div className="study-field">
            <label className="study-field__label">How supported did you feel? (1–5)</label>
            <div className="study-chip-row" role="group" aria-label="Supported rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`study-chip${survey.howSupported === n ? " study-chip--active" : ""}`}
                  onClick={() => setSurvey((s) => ({ ...s, howSupported: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="study-field">
            <label className="study-field__label">Did the AI agree with you?</label>
            <div className="study-chip-row">
              {["Yes", "No", "Mixed"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`study-chip${survey.aiAgreed === v ? " study-chip--active" : ""}`}
                  onClick={() => setSurvey((s) => ({ ...s, aiAgreed: v }))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="study-field">
            <label className="study-field__label">Did the AI challenge you?</label>
            <div className="study-chip-row">
              {["Yes", "No", "Slightly"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`study-chip${survey.aiChallenged === v ? " study-chip--active" : ""}`}
                  onClick={() => setSurvey((s) => ({ ...s, aiChallenged: v }))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="study-field">
            <label className="study-field__label">How satisfied are you with the response? (1–5)</label>
            <div className="study-chip-row" role="group" aria-label="Satisfaction rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`study-chip${survey.howSatisfied === n ? " study-chip--active" : ""}`}
                  onClick={() => setSurvey((s) => ({ ...s, howSatisfied: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="study-field">
            <label className="study-field__label" htmlFor="study-feedback">
              Optional feedback
            </label>
            <textarea
              id="study-feedback"
              className="study-textarea"
              value={survey.feedback}
              onChange={(e) => setSurvey((s) => ({ ...s, feedback: e.target.value }))}
              placeholder="Anything else you want researchers to know?"
              rows={4}
            />
          </div>

          {error && <div className="study-banner study-banner--error">{error}</div>}

          <div className="study-end__actions">
            <button type="button" className="study-btn study-btn--ghost" onClick={onBack} disabled={submitting}>
              Back to insights
            </button>
            <button
              type="submit"
              className="study-btn study-btn--primary study-btn--lg"
              disabled={submitting || !canSubmit}
            >
              {submitting ? "Submitting…" : "Submit responses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
