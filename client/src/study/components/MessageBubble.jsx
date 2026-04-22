export default function MessageBubble({ role, content, pending }) {
  const isUser = role === "user";
  return (
    <div className={`study-bubble study-bubble--${isUser ? "user" : "assistant"}`}>
      <div className="study-bubble__meta">{isUser ? "You" : "Assistant"}</div>
      <div className="study-bubble__body">{pending ? "…" : content}</div>
    </div>
  );
}
