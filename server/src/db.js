import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "sessions.db");

export function openDb() {
  const dir = path.dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      scenario_id INTEGER NOT NULL,
      mode TEXT NOT NULL,
      messages_json TEXT NOT NULL,
      user_sentiment_avg REAL,
      user_sentiment_label TEXT,
      llm_sentiment_avg REAL,
      llm_sentiment_label TEXT,
      disparity_label TEXT NOT NULL,
      survey_supported INTEGER,
      survey_agreed TEXT,
      survey_challenged TEXT,
      survey_satisfied INTEGER,
      feedback TEXT,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}
