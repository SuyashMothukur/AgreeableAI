export default function TransitionOverlay({ message, submessage }) {
  return (
    <div className="study-transition study-screen" role="status" aria-live="assertive">
      <div className="study-transition__card">
        <div className="study-spinner" aria-hidden="true" />
        <p className="study-transition__title">{message}</p>
        {submessage && <p className="study-transition__sub">{submessage}</p>}
      </div>
    </div>
  );
}
