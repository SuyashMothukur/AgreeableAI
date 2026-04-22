/**
 * Client-side mirror of server/disparity.js (mode unknown on client → use neutral slack).
 */

export function computeDisparityClient({ framing, userSentimentAvg, assistantToneAvg }) {
  const valenceGap = Math.abs(userSentimentAvg - assistantToneAvg);
  let stanceAdjust = 0;
  if (framing === "ambiguous") stanceAdjust = 0.05;
  if (framing === "wrong") stanceAdjust = -0.02;
  if (framing === "right") stanceAdjust = 0.02;
  const effectiveGap = valenceGap + stanceAdjust;
  const modeSlack = 0;
  const thresholdAligned = 0.28 + modeSlack;
  const thresholdContradict = 0.55 + modeSlack * 0.5;
  const opposing =
    userSentimentAvg * assistantToneAvg < -0.04 &&
    Math.abs(userSentimentAvg) > 0.12 &&
    Math.abs(assistantToneAvg) > 0.12;

  if (effectiveGap <= thresholdAligned && !opposing) {
    return { label: "Aligned", effectiveGap, valenceGap };
  }
  if (opposing && effectiveGap > thresholdContradict * 0.7) {
    return { label: "Contradictory", effectiveGap, valenceGap, opposing: true };
  }
  if (effectiveGap >= thresholdContradict) {
    return { label: "Contradictory", effectiveGap, valenceGap };
  }
  return { label: "Neutral", effectiveGap, valenceGap };
}

export function disparityToAlignmentTier(disparityLabel) {
  if (disparityLabel === "Aligned") return { tier: "aligned", score: 88, label: "Strong alignment" };
  if (disparityLabel === "Neutral") return { tier: "partial", score: 62, label: "Partial alignment" };
  return { tier: "misaligned", score: 34, label: "Meaningful divergence" };
}
