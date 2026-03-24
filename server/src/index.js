import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { computeDisparity } from "./disparity.js";
import { openDb } from "./db.js";
import { completeChat } from "./llm.js";
import { SCENARIOS, getScenarioById } from "./scenarios.js";
import {
  aggregateAssistantTone,
  aggregateUserSentiment,
} from "./sentiment.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const db = openDb();

const insertSession = db.prepare(`
  INSERT INTO sessions (
    id, scenario_id, mode, messages_json,
    user_sentiment_avg, user_sentiment_label,
    llm_sentiment_avg, llm_sentiment_label,
    disparity_label,
    survey_supported, survey_agreed, survey_challenged, survey_satisfied, feedback,
    created_at
  ) VALUES (
    @id, @scenario_id, @mode, @messages_json,
    @user_sentiment_avg, @user_sentiment_label,
    @llm_sentiment_avg, @llm_sentiment_label,
    @disparity_label,
    @survey_supported, @survey_agreed, @survey_challenged, @survey_satisfied, @feedback,
    @created_at
  )
`);

/** @type {Map<string, { scenarioId: number, mode: string, messages: {role: string, content: string}[], startedAt: string }>} */
const sessions = new Map();

const MODE_KEYS = ["supportive", "neutral", "challenging"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startScenario(req, res) {
  const scenario = pickRandom(SCENARIOS);
  const mode = pickRandom(MODE_KEYS);
  const sessionId = uuidv4();
  const startedAt = new Date().toISOString();
  sessions.set(sessionId, {
    scenarioId: scenario.id,
    mode,
    messages: [],
    startedAt,
  });
  const payload = {
    sessionId,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      emotional_framing: scenario.emotional_framing,
    },
  };
  if (process.env.REVEAL_MODE_TO_CLIENT === "1") {
    payload.mode = mode;
  }
  res.json(payload);
}

app.get("/scenario", startScenario);
app.get("/api/scenario", startScenario);

async function handleChat(req, res) {
  try {
    const { sessionId, content } = req.body || {};
    if (!sessionId || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "sessionId and content required" });
    }
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }
    const scenario = getScenarioById(session.scenarioId);
    session.messages.push({ role: "user", content: content.trim() });

    const { content: assistantText, placeholder } = await completeChat({
      messages: session.messages,
      modeKey: session.mode,
      scenario,
    });

    session.messages.push({ role: "assistant", content: assistantText });

    const userMsgs = session.messages.filter((m) => m.role === "user");
    const asstMsgs = session.messages.filter((m) => m.role === "assistant");
    const uAgg = aggregateUserSentiment(userMsgs);
    const aAgg = aggregateAssistantTone(asstMsgs);

    res.json({
      reply: assistantText,
      placeholder,
      sessionEcho: {
        messageCount: session.messages.length,
        userSentiment: uAgg,
        assistantTone: { avg: aAgg.avg, label: aAgg.label },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Chat failed" });
  }
}

app.post("/chat", handleChat);
app.post("/api/chat", handleChat);

function handleSubmit(req, res) {
  try {
    const { sessionId, survey } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found or already submitted" });
    }
    const hasUserMsg = session.messages.some((m) => m.role === "user");
    if (!hasUserMsg) {
      return res.status(400).json({ error: "Send at least one message before submitting" });
    }

    const s = survey || {};
    const supported = Number(s.howSupported);
    const satisfied = Number(s.howSatisfied);
    if (![1, 2, 3, 4, 5].includes(supported) || ![1, 2, 3, 4, 5].includes(satisfied)) {
      return res.status(400).json({ error: "Ratings must be 1–5" });
    }
    const agreed = s.aiAgreed;
    const challenged = s.aiChallenged;
    if (!["Yes", "No", "Mixed"].includes(agreed)) {
      return res.status(400).json({ error: "aiAgreed must be Yes, No, or Mixed" });
    }
    if (!["Yes", "No", "Slightly"].includes(challenged)) {
      return res.status(400).json({ error: "aiChallenged must be Yes, No, or Slightly" });
    }

    const userMsgs = session.messages.filter((m) => m.role === "user");
    const asstMsgs = session.messages.filter((m) => m.role === "assistant");
    const uAgg = aggregateUserSentiment(userMsgs);
    const aAgg = aggregateAssistantTone(asstMsgs);

    const { label: disparityLabel } = computeDisparity({
      scenarioId: session.scenarioId,
      userSentimentAvg: uAgg.avg,
      assistantToneAvg: aAgg.avg,
      mode: session.mode,
    });

    const row = {
      id: sessionId,
      scenario_id: session.scenarioId,
      mode: session.mode,
      messages_json: JSON.stringify(session.messages),
      user_sentiment_avg: uAgg.avg,
      user_sentiment_label: uAgg.label,
      llm_sentiment_avg: aAgg.avg,
      llm_sentiment_label: aAgg.label,
      disparity_label: disparityLabel,
      survey_supported: supported,
      survey_agreed: agreed,
      survey_challenged: challenged,
      survey_satisfied: satisfied,
      feedback: typeof s.feedback === "string" ? s.feedback.slice(0, 4000) : "",
      created_at: session.startedAt,
    };

    insertSession.run(row);
    sessions.delete(sessionId);

    res.json({
      ok: true,
      disparityLabel,
      saved: true,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Submit failed" });
  }
}

app.post("/submit", handleSubmit);
app.post("/api/submit", handleSubmit);

function handleStats(req, res) {
  const rows = db.prepare(`SELECT disparity_label, mode, survey_satisfied FROM sessions`).all();
  const total = rows.length;
  if (total === 0) {
    return res.json({
      total: 0,
      alignedPct: 0,
      neutralPct: 0,
      contradictoryPct: 0,
      avgSatisfactionByMode: {},
    });
  }

  let aligned = 0;
  let neutral = 0;
  let contradictory = 0;
  const modeSum = {};
  const modeCount = {};

  for (const r of rows) {
    if (r.disparity_label === "Aligned") aligned++;
    else if (r.disparity_label === "Neutral") neutral++;
    else if (r.disparity_label === "Contradictory") contradictory++;

    const m = r.mode || "unknown";
    modeSum[m] = (modeSum[m] || 0) + (r.survey_satisfied ?? 0);
    modeCount[m] = (modeCount[m] || 0) + 1;
  }

  const avgSatisfactionByMode = {};
  for (const m of Object.keys(modeSum)) {
    avgSatisfactionByMode[m] = Math.round((modeSum[m] / modeCount[m]) * 100) / 100;
  }

  res.json({
    total,
    alignedPct: Math.round((aligned / total) * 1000) / 10,
    neutralPct: Math.round((neutral / total) * 1000) / 10,
    contradictoryPct: Math.round((contradictory / total) * 1000) / 10,
    avgSatisfactionByMode,
  });
}

app.get("/stats", handleStats);
app.get("/api/stats", handleStats);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Sentiment Alignment API http://localhost:${PORT}`);
});
