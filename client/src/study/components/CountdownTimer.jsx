function formatMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function CountdownTimer({ remainingMs, label = "Time remaining" }) {
  const urgent = remainingMs <= 60_000;
  const critical = remainingMs <= 15_000;
  return (
    <div
      className={`study-timer${urgent ? " study-timer--urgent" : ""}${critical ? " study-timer--critical" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`${label}: ${formatMs(remainingMs)}`}
    >
      <span className="study-timer__label">{label}</span>
      <span className="study-timer__value">{formatMs(remainingMs)}</span>
    </div>
  );
}
