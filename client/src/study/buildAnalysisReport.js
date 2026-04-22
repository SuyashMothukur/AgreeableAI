import { aggregateAssistantTone, aggregateUserSentiment } from "./sentimentLocal.js";
import { computeDisparityClient, disparityToAlignmentTier } from "./disparityLocal.js";

function framingToStanceNote(framing) {
  if (framing === "right") return "The scenario framing positions the participant as morally justified.";
  if (framing === "wrong") return "The scenario framing positions the participant as morally implicated.";
  return "The scenario framing keeps moral responsibility open-ended.";
}

function describeUserEmotion(label, avg) {
  const intensity = Math.min(1, Math.abs(avg) / 0.45);
  const strength = intensity > 0.55 ? "pronounced" : intensity > 0.25 ? "moderate" : "subtle";
  if (label === "positive") return `${strength} positive or hopeful affect in what you wrote`;
  if (label === "negative") return `${strength} distressed, tense, or conflicted affect in what you wrote`;
  return `mixed or guarded emotional signals in what you wrote`;
}

function inferDefensiveness(userMessages) {
  const text = userMessages.map((m) => m.content).join(" ");
  const markers =
    (text.match(/\b(not my fault|didn't mean|had to|forced|anyway|but actually|you don't understand)\b/gi) || [])
      .length +
    (text.match(/!{2,}/g) || []).length * 2 +
    (text.match(/\b(always|never|everyone)\b/gi) || []).length * 0.5;
  const capped = Math.min(100, Math.round(28 + markers * 12 + Math.min(40, text.length / 25)));
  return capped;
}

function pickAssistantStrategy(asstAgg, userAgg) {
  if (asstAgg.challengeHits >= 2) return "Gentle challenge with alternative framings";
  if (userAgg.label === "negative" && asstAgg.label === "positive") return "Stabilize and validate before problem-solving";
  if (asstAgg.label === "neutral") return "Balanced reflection with low emotional amplification";
  return "Warm validation with invitations to elaborate";
}

function toneSelectionFromAssistant(asstAgg) {
  if (asstAgg.challengeHits >= 2) return "Firmer, analytic companion tone";
  if (asstAgg.label === "positive") return "Warm, affirming companion tone";
  if (asstAgg.label === "negative") return "Measured, grounding companion tone";
  return "Even, neutral companion tone";
}

function buildNotableMoments(messages) {
  const moments = [];
  const firstUser = messages.find((m) => m.role === "user");
  if (firstUser) {
    moments.push({
      title: "Opening stance",
      detail: "How you first entered the scenario often anchors the emotional frame for the exchange.",
      excerpt: firstUser.content.slice(0, 220) + (firstUser.content.length > 220 ? "…" : ""),
    });
  }
  const longestUser = [...messages]
    .filter((m) => m.role === "user")
    .sort((a, b) => b.content.length - a.content.length)[0];
  if (longestUser && (!firstUser || longestUser !== firstUser)) {
    moments.push({
      title: "Elaboration moment",
      detail: "A longer turn usually signals where you invested the most explanation or justification.",
      excerpt: longestUser.content.slice(0, 220) + (longestUser.content.length > 220 ? "…" : ""),
    });
  }
  const firstAi = messages.find((m) => m.role === "assistant");
  if (firstAi) {
    moments.push({
      title: "Assistant's first move",
      detail: "The opening reply reveals how the model initially oriented to your tone and content.",
      excerpt: firstAi.content.slice(0, 220) + (firstAi.content.length > 220 ? "…" : ""),
    });
  }
  return moments.slice(0, 3);
}

function buildDiscrepancies({ scenario, userAgg, asstAgg, internal, userMessages }) {
  const items = [];
  const def = internal.inferredDefensivenessLevel;
  if (def >= 65 && asstAgg.label === "positive" && userAgg.label === "negative") {
    items.push({
      id: "def-vs-warm",
      title: "Intensity gap",
      body: `Your language suggests elevated defensiveness or urgency (${def}/100 in a lightweight heuristic), while the assistant leaned warmer or more reassuring. That pairing can feel supportive—or, for some participants, slightly mis-timed.`,
    });
  }
  if (userAgg.label === "neutral" && asstAgg.challengeHits >= 2) {
    items.push({
      id: "neutral-vs-challenge",
      title: "Challenge without a clear emotional cue",
      body: "Your messages read fairly neutral, yet the assistant introduced several challenge-oriented cues. The model may have inferred unstated tension from phrasing that did not surface strongly in the sentiment heuristic.",
    });
  }
  if (scenario.emotional_framing === "wrong" && userAgg.label === "positive") {
    items.push({
      id: "framing-tone",
      title: "Framing vs. self-presentation",
      body: "The scenario assigns moral weight toward you, yet your expressed tone skewed positive. The assistant may have calibrated to the text rather than the vignette's moral posture—worth comparing when you read the internal reasoning below.",
    });
  }
  if (scenario.emotional_framing === "right" && userAgg.label === "negative") {
    items.push({
      id: "right-negative",
      title: "Justified stance, heavy affect",
      body: "The scenario supports your position, but your language carried strong negative affect. The assistant may have prioritized emotional support over reinforcing moral certainty.",
    });
  }
  if (!items.length) {
    items.push({
      id: "general",
      title: "Interpretive drift (normal in dialogue)",
      body: "No dramatic heuristic mismatches were detected. Small divergences still appear whenever natural language compresses a lived situation into short turns—use the sections below as prompts, not verdicts.",
    });
  }
  const joined = userMessages.map((m) => m.content).join(" ");
  if (joined.length < 80) {
    items.push({
      id: "brevity",
      title: "Limited textual signal",
      body: "Very short user contributions give the model less evidence. Internal inferences below are therefore more uncertain—this is expected in timed studies.",
    });
  }
  return items.slice(0, 4);
}

function conversationSummary(scenario, userMessages, asstMessages) {
  const u = userMessages.length;
  const a = asstMessages.length;
  return `You explored “${scenario.title}” across ${u} participant turn${u === 1 ? "" : "s"} and ${a} assistant turn${a === 1 ? "" : "s"}. The exchange stayed focused on how you experienced the situation and how the assistant responded in real time.`;
}

/**
 * @param {{ scenario: object, messages: {role:string,content:string}[], sessionEcho?: object | null }} input
 */
export function buildAnalysisReport({ scenario, messages, sessionEcho }) {
  const userMessages = messages.filter((m) => m.role === "user");
  const asstMessages = messages.filter((m) => m.role === "assistant");
  const userAgg = aggregateUserSentiment(userMessages);
  const asstAgg = aggregateAssistantTone(asstMessages);

  if (sessionEcho?.userSentiment && userMessages.length) {
    userAgg.avg = sessionEcho.userSentiment.avg ?? userAgg.avg;
    userAgg.label = sessionEcho.userSentiment.label ?? userAgg.label;
  }
  if (sessionEcho?.assistantTone && asstMessages.length) {
    asstAgg.avg = sessionEcho.assistantTone.avg ?? asstAgg.avg;
    asstAgg.label = sessionEcho.assistantTone.label ?? asstAgg.label;
  }

  const framing = scenario.emotional_framing || "ambiguous";
  const disparity = computeDisparityClient({
    framing,
    userSentimentAvg: userAgg.avg,
    assistantToneAvg: asstAgg.avg,
  });
  const alignment = disparityToAlignmentTier(disparity.label);

  const inferredDefensivenessLevel = inferDefensiveness(userMessages);
  const perceivedUserEmotion = describeUserEmotion(userAgg.label, userAgg.avg);
  const perceivedMoralStance = framingToStanceNote(framing);
  const intendedAssistantStrategy = pickAssistantStrategy(asstAgg, userAgg);
  const responseToneSelection = toneSelectionFromAssistant(asstAgg);

  const internalReasoning = {
    perceivedUserEmotion,
    perceivedMoralStance,
    inferredDefensivenessLevel,
    intendedAssistantStrategy,
    responseToneSelection,
    modelNote:
      "This block simulates what an interpretability layer might surface: inferred stance and strategy, not literal chain-of-thought. Replace with logged model metadata when your study pipeline provides it.",
  };

  const discrepancies = buildDiscrepancies({
    scenario,
    userAgg,
    asstAgg,
    internal: internalReasoning,
    userMessages,
  });

  return {
    conversationSummary: conversationSummary(scenario, userMessages, asstMessages),
    userExpressed: {
      headline: "What you seemed to express",
      sentimentLabel: userAgg.label,
      sentimentScore: Math.round(userAgg.avg * 100) / 100,
      narrative: `Across your messages, a lightweight language heuristic reads your overall emotional valence as “${
        userAgg.label
      }” (score ${Math.round(userAgg.avg * 100) / 100} on a −1…1 scale). This is an approximate read of surface cues, not a clinical assessment.`,
    },
    internalReasoning,
    alignment: {
      ...alignment,
      disparityLabel: disparity.label,
      explainer: `Heuristic gap between your averaged emotional valence and the assistant's averaged tone suggests ${disparity.label.toLowerCase()} correspondence under the study's simple disparity model (mode-neutral on the client).`,
    },
    discrepancies,
    notableMoments: buildNotableMoments(messages),
    outcomeVisual: {
      userValence: Math.round((userAgg.avg + 1) * 50),
      assistantValence: Math.round((asstAgg.avg + 1) * 50),
      gap: Math.round(Math.abs(userAgg.avg - asstAgg.avg) * 100),
    },
  };
}
