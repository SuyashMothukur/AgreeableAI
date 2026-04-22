import { useCallback, useEffect, useRef, useState } from "react";
import { fetchScenario, sendChat, submitSession } from "../api.js";
import { STUDY_DURATION_MS, STUDY_PHASE, POST_TIMER_TRANSITION_MS } from "./constants.js";
import { buildAnalysisReport } from "./buildAnalysisReport.js";
import { useCountdown } from "./hooks/useCountdown.js";
import ProgressSteps from "./components/ProgressSteps.jsx";
import StartScreen from "./components/StartScreen.jsx";
import ScenarioChatScreen from "./components/ScenarioChatScreen.jsx";
import TransitionOverlay from "./components/TransitionOverlay.jsx";
import AnalysisScreen from "./components/AnalysisScreen.jsx";
import EndSurveyForm from "./components/EndSurveyForm.jsx";

function activeProgressStep(phase) {
  if (phase === STUDY_PHASE.START || phase === STUDY_PHASE.LOADING_SCENARIO) return 1;
  if (phase === STUDY_PHASE.CHAT || phase === STUDY_PHASE.POST_TIMER) return 2;
  return 3;
}

export default function StudyExperience() {
  const [phase, setPhase] = useState(STUDY_PHASE.START);
  const [sessionId, setSessionId] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionEcho, setSessionEcho] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [surveyError, setSurveyError] = useState(null);
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);

  const messagesRef = useRef([]);
  const scenarioRef = useRef(null);
  const sessionEchoRef = useRef(null);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);
  useEffect(() => {
    sessionEchoRef.current = sessionEcho;
  }, [sessionEcho]);

  const handleExpire = useCallback(() => {
    setPhase(STUDY_PHASE.POST_TIMER);
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      const report = buildAnalysisReport({
        scenario: scenarioRef.current,
        messages: messagesRef.current,
        sessionEcho: sessionEchoRef.current,
      });
      setAnalysisReport(report);
      setPhase(STUDY_PHASE.ANALYSIS);
      transitionTimerRef.current = null;
    }, POST_TIMER_TRANSITION_MS);
  }, []);

  const { remainingMs, start, stop, resetCompleted } = useCountdown(handleExpire);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      stop();
    },
    [stop]
  );

  const beginSession = useCallback(async () => {
    setLoadError(null);
    setPhase(STUDY_PHASE.LOADING_SCENARIO);
    try {
      const data = await fetchScenario();
      setSessionId(data.sessionId);
      setScenario(data.scenario);
      setMessages([]);
      setSessionEcho(null);
      setInput("");
      resetCompleted();
      start(STUDY_DURATION_MS);
      setPhase(STUDY_PHASE.CHAT);
    } catch (e) {
      setLoadError(e.message || "Could not load scenario");
      setPhase(STUDY_PHASE.START);
    }
  }, [resetCompleted, start]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (phase !== STUDY_PHASE.CHAT || !sessionId || !input.trim() || sending) return;
      if (remainingMs <= 0) return;
      const text = input.trim();
      setSending(true);
      setLoadError(null);
      setInput("");
      setMessages((m) => [...m, { role: "user", content: text }]);
      try {
        const data = await sendChat(sessionId, text);
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        if (data.sessionEcho) setSessionEcho(data.sessionEcho);
      } catch (err) {
        setMessages((m) => m.slice(0, -1));
        setInput(text);
        setLoadError(err.message || "Message failed");
      } finally {
        setSending(false);
      }
    },
    [phase, sessionId, input, sending, remainingMs]
  );

  const hasUserMessage = messages.some((m) => m.role === "user");

  const goToSurvey = useCallback(() => {
    setSurveyError(null);
    setPhase(STUDY_PHASE.END_SURVEY);
  }, []);

  const backToAnalysis = useCallback(() => {
    setPhase(STUDY_PHASE.ANALYSIS);
  }, []);

  const handleSurveySubmit = useCallback(
    async (survey) => {
      if (!sessionId) return;
      setSubmittingSurvey(true);
      setSurveyError(null);
      try {
        await submitSession(sessionId, survey);
        stop();
        setPhase(STUDY_PHASE.SUBMITTED);
      } catch (err) {
        setSurveyError(err.message || "Submit failed");
      } finally {
        setSubmittingSurvey(false);
      }
    },
    [sessionId, stop]
  );

  const restartStudy = useCallback(() => {
    stop();
    resetCompleted();
    setSessionId(null);
    setScenario(null);
    setMessages([]);
    setSessionEcho(null);
    setAnalysisReport(null);
    setInput("");
    setLoadError(null);
    setSurveyError(null);
    setPhase(STUDY_PHASE.START);
  }, [resetCompleted, stop]);

  return (
    <div className="study-experience">
      <ProgressSteps activeStep={activeProgressStep(phase)} />

      {(phase === STUDY_PHASE.START || phase === STUDY_PHASE.LOADING_SCENARIO) && (
        <StartScreen
          onStart={beginSession}
          loading={phase === STUDY_PHASE.LOADING_SCENARIO}
          error={loadError}
        />
      )}

      {phase === STUDY_PHASE.CHAT && (
        <>
          <ScenarioChatScreen
            scenario={scenario}
            remainingMs={remainingMs}
            messages={messages}
            sending={sending}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            sessionReady={Boolean(sessionId)}
          />
          {loadError && (
            <div className="study-floating-error" role="alert">
              {loadError}
            </div>
          )}
        </>
      )}

      {phase === STUDY_PHASE.POST_TIMER && (
        <TransitionOverlay
          message="Time is up."
          submessage="Preparing reflection analysis from your conversation…"
        />
      )}

      {phase === STUDY_PHASE.ANALYSIS && analysisReport && <AnalysisScreen report={analysisReport} onContinue={goToSurvey} />}

      {phase === STUDY_PHASE.END_SURVEY && (
        <EndSurveyForm
          onSubmit={handleSurveySubmit}
          submitting={submittingSurvey}
          error={surveyError}
          onBack={backToAnalysis}
          canSubmit={hasUserMessage}
          onRestart={restartStudy}
        />
      )}

      {phase === STUDY_PHASE.SUBMITTED && (
        <div className="study-thanks study-screen study-screen--enter">
          <div className="study-thanks__card">
            <p className="study-eyebrow">Thank you</p>
            <h1 className="study-thanks__title">Your responses were recorded</h1>
            <p className="study-thanks__text">
              This session is complete. If you would like to contribute another datapoint, you may begin a fresh study
              session.
            </p>
            <button type="button" className="study-btn study-btn--primary study-btn--lg" onClick={restartStudy}>
              Start new study session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
