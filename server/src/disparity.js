import { getScenarioById } from "./scenarios.js";

/**
 * Heuristic: compare user emotional valence + scenario stance vs assistant tone.
 * Labels: Aligned | Neutral | Contradictory
 */
export function computeDisparity({
  scenarioId,
  userSentimentAvg,
  assistantToneAvg,
  mode,
}) {
  const scenario = getScenarioById(scenarioId);
  const framing = scenario?.emotional_framing ?? "ambiguous";

  // Emotional distance between user messages and assistant replies
  const valenceGap = Math.abs(userSentimentAvg - assistantToneAvg);

  // Stance weight: if user is "in the wrong" in the vignette, supportive LLM might still feel "aligned" as support — we use gap primarily
  let stanceAdjust = 0;
  if (framing === "ambiguous") stanceAdjust = 0.05;
  if (framing === "wrong") stanceAdjust = -0.02;
  if (framing === "right") stanceAdjust = 0.02;

  const effectiveGap = valenceGap + stanceAdjust;

  // Mode expectations: challenging mode may widen perceived gap without being "bad"
  const modeSlack =
    mode === "challenging" ? 0.12 : mode === "supportive" ? -0.05 : 0;

  const thresholdAligned = 0.28 + modeSlack;
  const thresholdContradict = 0.55 + modeSlack * 0.5;

  // Opposing valence: user negative, assistant strongly positive (or vice versa) can still be "aligned" as care — handled by gap
  const opposing =
    userSentimentAvg * assistantToneAvg < -0.04 &&
    Math.abs(userSentimentAvg) > 0.12 &&
    Math.abs(assistantToneAvg) > 0.12;

  if (effectiveGap <= thresholdAligned && !opposing) {
    return { label: "Aligned", detail: { effectiveGap, valenceGap, framing } };
  }
  if (opposing && effectiveGap > thresholdContradict * 0.7) {
    return {
      label: "Contradictory",
      detail: { effectiveGap, valenceGap, framing, opposing: true },
    };
  }
  if (effectiveGap >= thresholdContradict) {
    return { label: "Contradictory", detail: { effectiveGap, valenceGap, framing } };
  }
  return { label: "Neutral", detail: { effectiveGap, valenceGap, framing } };
}
