import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchScenario, sendChat, submitSession } from "./api.js";
import "./App.css";

function framingLabel(framing) {
  if (framing === "right") return "Framing: you are clearly in the right";
  if (framing === "wrong") return "Framing: you are clearly in the wrong";
  return "Framing: ambiguous / conflict";
}

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scrollRef = useRef(null);

  const loadScenario = useCallback(async () => {
    setLoadingScenario(true);
    setError(null);
    setSubmitted(false);
    setShowSurvey(false);
    setMessages([]);
    setInput("");
    try {
      const data = await fetchScenario();
      setSessionId(data.sessionId);
      setScenario(data.scenario);
    } catch (e) {
      setError(e.message || "Could not load scenario");
    } finally {
      setLoadingScenario(false);
    }
  }, []);

  useEffect(() => {
    loadScenario();
  }, [loadScenario]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    if (!sessionId || !input.trim() || sending) return;
    setSending(true);
    setError(null);
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    try {
      const data = await sendChat(sessionId, text);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      setError(err.message || "Message failed");
    } finally {
      setSending(false);
    }
  }

  const [survey, setSurvey] = useState({
    howSupported: 3,
    aiAgreed: "Mixed",
    aiChallenged: "Slightly",
    howSatisfied: 3,
    feedback: "",
  });

  async function handleSurveySubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await submitSession(sessionId, {
        howSupported: survey.howSupported,
        aiAgreed: survey.aiAgreed,
        aiChallenged: survey.aiChallenged,
        howSatisfied: survey.howSatisfied,
        feedback: survey.feedback,
      });
      setSubmitted(true);
      setShowSurvey(false);
    } catch (err) {
      setError(err.message || "Submit failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Sentiment Alignment Study</h1>
        <nav className="app-header-links">
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <div className="split">
        <aside className="panel">
          <p className="scenario-kicker">Scenario</p>
          {loadingScenario && <p className="muted">Loading…</p>}
          {!loadingScenario && scenario && (
            <>
              <h2 className="scenario-title">{scenario.title}</h2>
              <span className="framing-pill">{framingLabel(scenario.emotional_framing)}</span>
              <p className="scenario-desc">{scenario.description}</p>
              <button type="button" className="btn" onClick={loadScenario}>
                Start New Scenario
              </button>
            </>
          )}
        </aside>

        <section className="panel panel-chat">
          <div className="chat-toolbar">
            <h2 className="chat-title">Conversation</h2>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!sessionId || messages.length === 0 || sending}
              onClick={() => setShowSurvey(true)}
            >
              End &amp; survey
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <p className="empty-chat">
                Describe how you feel and what you are thinking about this situation. The assistant will respond in
                real time.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role === "user" ? "msg-user" : "msg-ai"}`}>
                <div className="msg-meta">{msg.role === "user" ? "You" : "Assistant"}</div>
                {msg.content}
              </div>
            ))}
            {sending && (
              <div className="msg msg-ai">
                <div className="msg-meta">Assistant</div>
                …
              </div>
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <textarea
              className="chat-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              disabled={!sessionId || sending}
            />
            <button type="submit" className="btn btn-primary" disabled={!sessionId || !input.trim() || sending}>
              Send
            </button>
          </form>
        </section>
      </div>

      {showSurvey && !submitted && (
        <div className="survey-overlay" role="dialog" aria-modal="true" aria-labelledby="survey-title">
          <form className="survey-card" onSubmit={handleSurveySubmit}>
            <h2 id="survey-title">Quick reflection</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Answer honestly — there are no wrong responses.
            </p>

            <div className="field">
              <label htmlFor="sup">How supported did you feel? (1–5)</label>
              <div className="rating-row" id="sup">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn ${survey.howSupported === n ? "btn-primary" : ""}`}
                    onClick={() => setSurvey((s) => ({ ...s, howSupported: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Did the AI agree with you?</label>
              <div className="select-like">
                {["Yes", "No", "Mixed"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`btn ${survey.aiAgreed === v ? "btn-primary" : ""}`}
                    onClick={() => setSurvey((s) => ({ ...s, aiAgreed: v }))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Did the AI challenge you?</label>
              <div className="select-like">
                {["Yes", "No", "Slightly"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`btn ${survey.aiChallenged === v ? "btn-primary" : ""}`}
                    onClick={() => setSurvey((s) => ({ ...s, aiChallenged: v }))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>How satisfied are you with the response? (1–5)</label>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn ${survey.howSatisfied === n ? "btn-primary" : ""}`}
                    onClick={() => setSurvey((s) => ({ ...s, howSatisfied: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="fb">Optional feedback</label>
              <textarea
                id="fb"
                className="textarea-feedback"
                value={survey.feedback}
                onChange={(e) => setSurvey((s) => ({ ...s, feedback: e.target.value }))}
                placeholder="Anything else you want to note?"
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="survey-actions">
              <button type="button" className="btn" onClick={() => setShowSurvey(false)} disabled={sending}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Saving…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {submitted && (
        <div className="survey-overlay">
          <div className="survey-card thanks">
            <h2>Thank you</h2>
            <p className="muted">Your responses were recorded. You can start a new scenario anytime.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: "0.75rem" }} onClick={loadScenario}>
              New scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
