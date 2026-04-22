import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStats } from "./api.js";
import "./study/study.css";

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
    <div className="study-app">
      <header className="study-app-header">
        <div className="study-app-header__brand">
          <span className="study-app-header__tag">Research platform</span>
          <p className="study-app-header__title">Study dashboard</p>
        </div>
        <nav className="study-app-header__links" aria-label="Secondary navigation">
          <Link to="/">Back to participant study</Link>
        </nav>
      </header>
      <main className="study-dashboard">
        <div className="study-dashboard__card">
          <h1 className="study-dashboard__title">Session aggregates</h1>
          {error && <div className="study-banner study-banner--error">{error}</div>}
          {!stats && !error && <p className="study-muted">Loading…</p>}
          {stats && (
            <>
              <p style={{ marginTop: 0 }}>
                <strong>Total sessions:</strong> {stats.total}
              </p>
              {stats.total === 0 ? (
                <p className="study-muted">Complete at least one session with survey to see aggregates.</p>
              ) : (
                <>
                  <p>
                    <strong>Aligned:</strong> {stats.alignedPct}% · <strong>Neutral:</strong> {stats.neutralPct}% ·{" "}
                    <strong>Contradictory:</strong> {stats.contradictoryPct}%
                  </p>
                  <p className="study-muted" style={{ fontSize: "0.9rem" }}>
                    Disparity labels use the server heuristic (user vs assistant tone), not survey answers.
                  </p>
                  <h2 style={{ fontSize: "1.05rem", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
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
      </main>
    </div>
  );
}
