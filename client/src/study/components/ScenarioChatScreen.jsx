import CountdownTimer from "./CountdownTimer.jsx";
import ScenarioPanel from "./ScenarioPanel.jsx";
import ChatWindow from "./ChatWindow.jsx";

export default function ScenarioChatScreen({
  scenario,
  remainingMs,
  timeUp,
  messages,
  sending,
  input,
  onInputChange,
  onSend,
  onFinishChat,
  sessionReady,
}) {

  return (
    <div className="study-chat-screen study-screen study-screen--enter">
      <header className="study-chat-screen__top">
        <div>
          <p className="study-eyebrow">Step 2 · Timed conversation</p>
          <h1 className="study-chat-screen__title">Active scenario</h1>
          <p className="study-chat-screen__subtitle">
            Focus on the scenario and the assistant. When the timer ends, you can either keep chatting or finish and continue.
          </p>
        </div>
        {!timeUp ? (
          <CountdownTimer remainingMs={remainingMs} />
        ) : (
          <button
            className="study-btn study-btn--primary study-btn--lg"
            onClick={onFinishChat}
          >
            Continue to survey
          </button>
        )}
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
            disabled={!sessionReady || sending}
            timeUp={timeUp}
            placeholder={
              timeUp
                ? "The timer has ended, but you can keep chatting if you'd like…"
                : "Share what feels most salient for you…"
            }
          />
        </div>
      </div>
    </div>
  );
}
