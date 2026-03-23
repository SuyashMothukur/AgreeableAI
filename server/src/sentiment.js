/**
 * Lightweight keyword-based sentiment / tone for MVP.
 * Returns score in [-1, 1] and a coarse label.
 */

const POS = /\b(good|great|happy|relieved|grateful|fair|right|hope|thanks|love|proud|calm|okay|ok|better|support|understand|sorry|listen)\b/i;
const NEG = /\b(angry|furious|unfair|wrong|hate|hurt|anxious|stressed|guilty|ashamed|lonely|tired|exhausted|frustrat|upset|worried|afraid|sad|bad|never|always|worst|ruin|attack|blame)\b/i;
const CHALLENGE = /\b(however|but|actually|disagree|wrong|mistake|consider|risk|harm|unfair|inappropriate|instead|evidence|alternative)\b/i;

export function scoreText(text) {
  if (!text || typeof text !== "string") return 0;
  const t = text.trim();
  if (!t) return 0;
  let score = 0;
  const posMatches = t.match(new RegExp(POS.source, "gi"));
  const negMatches = t.match(new RegExp(NEG.source, "gi"));
  if (posMatches) score += Math.min(0.35, 0.08 * posMatches.length);
  if (negMatches) score -= Math.min(0.45, 0.1 * negMatches.length);
  const words = t.split(/\s+/).length;
  const intensity = Math.min(1, words / 80);
  score *= 0.6 + 0.4 * intensity;
  return Math.max(-1, Math.min(1, score));
}

export function labelFromScore(score) {
  if (score > 0.15) return "positive";
  if (score < -0.15) return "negative";
  return "neutral";
}

/** Tone hint for assistant messages (challenge vs warmth). */
export function assistantToneFeatures(text) {
  const s = scoreText(text);
  const challenges = CHALLENGE.test(text) ? 1 : 0;
  return { score: s, challenges, label: labelFromScore(s) };
}

export function aggregateUserSentiment(userMessages) {
  if (!userMessages.length) return { avg: 0, label: "neutral" };
  const scores = userMessages.map((m) => scoreText(m.content));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { avg, label: labelFromScore(avg) };
}

export function aggregateAssistantTone(assistantMessages) {
  if (!assistantMessages.length) return { avg: 0, label: "neutral", challengeHits: 0 };
  let challengeHits = 0;
  const scores = assistantMessages.map((m) => {
    const f = assistantToneFeatures(m.content);
    challengeHits += f.challenges;
    return f.score;
  });
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { avg, label: labelFromScore(avg), challengeHits };
}
