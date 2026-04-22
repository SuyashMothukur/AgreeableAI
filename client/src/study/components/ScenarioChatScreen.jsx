import CountdownTimer from "./CountdownTimer.jsx";
import ScenarioPanel from "./ScenarioPanel.jsx";
import ChatWindow from "./ChatWindow.jsx";

export default function ScenarioChatScreen({
  scenario,
  remainingMs,
  messages,
  sending,
  input,
  onInputChange,
  onSend,
  sessionReady,
}) {
  const locked = remainingMs <= 0;

  return (
    <div className="study-chat-screen study-screen study-screen--enter">
      <header className="study-chat-screen__top">
        <div>
          <p className="study-eyebrow">Step 2 · Timed conversation</p>
          <h1 className="study-chat-screen__title">Active scenario</h1>
          <p className="study-chat-screen__subtitle">
            Focus on the scenario and the assistant. Reflection unlocks automatically when the timer completes.
          </p>
        </div>
        <CountdownTimer remainingMs={remainingMs} />
      </header>

      <div className="study-chat-screen__body">
        <div className="study-chat-screen__scenario">
          <ScenarioPanel scenario={scenario} />
        </div>
        <div className="study-chat-screen__chat">
          <ChatWindow
            messages={messages}
            sending={sending}
            input={input}
            onInputChange={onInputChange}
            onSubmit={onSend}
            disabled={!sessionReady || sending || locked}
            locked={locked}
            placeholder={locked ? "Session locked after timer" : "Share what feels most salient for you…"}
          />
        </div>
      </div>
    </div>
  );
}
