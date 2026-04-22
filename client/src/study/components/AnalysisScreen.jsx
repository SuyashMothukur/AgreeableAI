import { AnalysisCard } from "./AnalysisCard.jsx";
import DiscrepancyList from "./DiscrepancyList.jsx";
import AlignmentMeter from "./AlignmentMeter.jsx";

export default function AnalysisScreen({ report, onContinue }) {
  const { internalReasoning } = report;
  return (
    <div className="study-analysis study-screen study-screen--enter">
      <div className="study-analysis__intro">
        <p className="study-eyebrow">Step 3 · Structured reflection</p>
        <h1 className="study-analysis__title">Conversation insights</h1>
        <p className="study-analysis__lede">
          The goal here is transparency, not judgment. These panels compare <strong>what you expressed</strong>,{" "}
          <strong>what a lightweight model-side view infers</strong>, and <strong>how the assistant actually
          replied</strong>—so you can notice alignment and drift for yourself.
        </p>
      </div>

      <div className="study-analysis__grid">
        <AnalysisCard title="Conversation summary" subtitle="High-level arc of this timed session">
          <p className="study-prose">{report.conversationSummary}</p>
        </AnalysisCard>

        <AnalysisCard title="User expressed sentiment" subtitle="Heuristic read of your language">
          <p className="study-prose">{report.userExpressed.narrative}</p>
          <dl className="study-kv">
            <div>
              <dt>Valence label</dt>
              <dd>{report.userExpressed.sentimentLabel}</dd>
            </div>
            <div>
              <dt>Valence score</dt>
              <dd>{report.userExpressed.sentimentScore}</dd>
            </div>
          </dl>
        </AnalysisCard>

        <AnalysisCard title="AI internal reasoning (simulated)" subtitle="Replace with logged interpretability data">
          <p className="study-prose study-prose--muted">{internalReasoning.modelNote}</p>
          <dl className="study-kv study-kv--stack">
            <div>
              <dt>Perceived user emotion</dt>
              <dd>{internalReasoning.perceivedUserEmotion}</dd>
            </div>
            <div>
              <dt>Perceived moral stance (from scenario)</dt>
              <dd>{internalReasoning.perceivedMoralStance}</dd>
            </div>
            <div>
              <dt>Inferred defensiveness level</dt>
              <dd>
                {internalReasoning.inferredDefensivenessLevel}/100 <span className="study-muted">(exploratory)</span>
              </dd>
            </div>
            <div>
              <dt>Intended assistant strategy</dt>
              <dd>{internalReasoning.intendedAssistantStrategy}</dd>
            </div>
            <div>
              <dt>Response tone selection</dt>
              <dd>{internalReasoning.responseToneSelection}</dd>
            </div>
          </dl>
        </AnalysisCard>

        <AnalysisCard title="Response alignment" subtitle="Heuristic correspondence">
          <AlignmentMeter
            tier={report.alignment.tier}
            score={report.alignment.score}
            label={report.alignment.label}
            explainer={report.alignment.explainer}
          />
        </AnalysisCard>

        <AnalysisCard title="Key discrepancies" subtitle="Where signals diverge—use as prompts" variant="accent">
          <DiscrepancyList items={report.discrepancies} />
        </AnalysisCard>

        <AnalysisCard title="Notable moments" subtitle="Anchors from your exchange">
          <ul className="study-moments">
            {report.notableMoments.map((m) => (
              <li key={m.title} className="study-moments__item">
                <h4 className="study-moments__title">{m.title}</h4>
                <p className="study-moments__detail">{m.detail}</p>
                <blockquote className="study-moments__quote">{m.excerpt}</blockquote>
              </li>
            ))}
          </ul>
        </AnalysisCard>

        <AnalysisCard title="Outcome snapshot" subtitle="Visual compression of valence gap">
          <div className="study-outcome">
            <div className="study-outcome__bar">
              <span className="study-outcome__label">You (0–100)</span>
              <div className="study-outcome__track">
                <span className="study-outcome__fill study-outcome__fill--user" style={{ width: `${report.outcomeVisual.userValence}%` }} />
              </div>
              <span className="study-outcome__value">{report.outcomeVisual.userValence}</span>
            </div>
            <div className="study-outcome__bar">
              <span className="study-outcome__label">Assistant (0–100)</span>
              <div className="study-outcome__track">
                <span
                  className="study-outcome__fill study-outcome__fill--asst"
                  style={{ width: `${report.outcomeVisual.assistantValence}%` }}
                />
              </div>
              <span className="study-outcome__value">{report.outcomeVisual.assistantValence}</span>
            </div>
            <p className="study-outcome__gap">Heuristic gap magnitude: {report.outcomeVisual.gap}</p>
          </div>
        </AnalysisCard>

        <AnalysisCard title="Final reflection prompt" subtitle="Private note to yourself">
          <p className="study-prose">
            Where did the assistant’s read match your lived experience, and where did it feel incomplete? If you had
            another minute, what would you add or correct?
          </p>
        </AnalysisCard>
      </div>

      <div className="study-analysis__cta">
        <button type="button" className="study-btn study-btn--primary study-btn--lg" onClick={onContinue}>
          Continue to end survey
        </button>
      </div>
    </div>
  );
}
