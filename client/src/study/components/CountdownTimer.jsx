function formatMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function CountdownTimer({ remainingMs, timeUp = false, label = "Time remaining" }) {
  const urgent = !timeUp && remainingMs <= 60_000;
  const critical = !timeUp && remainingMs <= 15_000;
  const timerLabel = timeUp ? "Recommended time reached" : label;
  const timerValue = timeUp ? "0:00" : formatMs(remainingMs);

  return (
    <div
      className={`study-timer${urgent ? " study-timer--urgent" : ""}${
        critical ? " study-timer--critical" : ""
      }${timeUp ? " study-timer--done" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`${timerLabel}: ${timerValue}`}
    >
      <span className="study-timer__label">{timerLabel}</span>
      <span className="study-timer__value">{timerValue}</span>
    </div>
  );
}