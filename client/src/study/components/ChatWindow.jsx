import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({
  messages,
  sending,
  input,
  onInputChange,
  onSubmit,
  disabled,
  locked,
  placeholder,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  return (
    <section className="study-chat" aria-label="Conversation with assistant">
      <div className="study-chat__head">
        <h2 className="study-chat__title">Live conversation</h2>
        <p className="study-chat__hint">
          {locked
            ? "Timer ended — input is locked. Moving to reflection."
            : "Speak freely; the assistant responds in real time."}
        </p>
      </div>
      <div className="study-chat__scroll" ref={scrollRef}>
        {messages.length === 0 && !sending && (
          <p className="study-chat__empty">
            Describe how the situation lands for you—emotionally, morally, or practically. Short or long turns are both
            fine.
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.role}-${i}`} role={msg.role} content={msg.content} />
        ))}
        {sending && <MessageBubble role="assistant" content="" pending />}
      </div>
      <form className="study-chat__form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="study-chat-input">
          Message to assistant
        </label>
        <textarea
          id="study-chat-input"
          className="study-chat__input"
          rows={3}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button type="submit" className="study-btn study-btn--primary" disabled={disabled || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
