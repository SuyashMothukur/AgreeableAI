import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStats } from "./api.js";
import "./App.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load stats");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Study dashboard</h1>
        <nav className="app-header-links">
          <Link to="/">Back to study</Link>
        </nav>
      </header>
      <div className="panel" style={{ border: "none", maxWidth: 560 }}>
        {error && <div className="error-banner">{error}</div>}
        {!stats && !error && <p className="muted">Loading…</p>}
        {stats && (
          <>
            <p style={{ marginTop: 0 }}>
              <strong>Total sessions:</strong> {stats.total}
            </p>
            {stats.total === 0 ? (
              <p className="muted">Complete at least one session with survey to see aggregates.</p>
            ) : (
              <>
                <p>
                  <strong>Aligned:</strong> {stats.alignedPct}% · <strong>Neutral:</strong> {stats.neutralPct}% ·{" "}
                  <strong>Contradictory:</strong> {stats.contradictoryPct}%
                </p>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  Disparity labels use the server heuristic (user vs assistant tone), not survey answers.
                </p>
                <h2 className="scenario-title" style={{ fontSize: "1rem", marginTop: "1.25rem" }}>
                  Average satisfaction by mode
                </h2>
                <ul style={{ paddingLeft: "1.1rem", margin: "0.5rem 0 0" }}>
                  {Object.entries(stats.avgSatisfactionByMode || {}).map(([mode, avg]) => (
                    <li key={mode}>
                      <strong>{mode}</strong>: {avg}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
