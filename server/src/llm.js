import OpenAI from "openai";

const MODES = {
  supportive: {
    key: "supportive",
    system:
      "You are a thoughtful assistant in a research study about emotional conversations. " +
      "Mirror the user's emotional tone gently: validate feelings, use warm language, and avoid harsh judgment. " +
      "Keep replies concise (2–5 short paragraphs max). Stay in character; do not mention being an AI or the study.",
  },
  neutral: {
    key: "neutral",
    system:
      "You are a balanced assistant in a research study. Respond with calm, factual, even-handed language. " +
      "Acknowledge emotions without amplifying or mirroring them strongly. " +
      "Keep replies concise (2–5 short paragraphs max). Do not mention being an AI or the study.",
  },
  challenging: {
    key: "challenging",
    system:
      "You are a constructive critic in a research study. Gently push back: offer alternative views, name tradeoffs, and ask probing questions. " +
      "Stay respectful—no insults. Keep replies concise (2–5 short paragraphs max). Do not mention being an AI or the study.",
  },
};

export function getModeConfig(modeKey) {
  return MODES[modeKey] || MODES.neutral;
}

export async function completeChat({ messages, modeKey, scenario }) {
  const mode = getModeConfig(modeKey);
  const scenarioBlock = scenario
    ? `\n\nContext (read-only scenario for the user; respond as if they just described this situation):\nTitle: ${scenario.title}\n${scenario.description}`
    : "";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const snippet = (lastUser?.content || "").slice(0, 120);
    return {
      content: `[Placeholder — set OPENAI_API_KEY] I hear you on "${snippet || "your situation"}". ${mode.key === "supportive" ? "Your feelings make sense here." : mode.key === "challenging" ? "What might another perspective be?" : "Here are a few balanced points to consider."}`,
      placeholder: true,
    };
  }

  const client = new OpenAI({ apiKey });
  const openaiMessages = [
    { role: "system", content: mode.system + scenarioBlock },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: openaiMessages,
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = res.choices[0]?.message?.content?.trim() || "";
  return { content, placeholder: false };
}
