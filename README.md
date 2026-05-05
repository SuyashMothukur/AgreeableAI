# AgreeableAI

**Goal:** Run short chat sessions where people talk to an assistant, then report how supported they felt. The app compares that self-report to an automatic “sentiment alignment” score between what they said and how the assistant replied—so you can study whether **felt support** matches **measured alignment**, and how different assistant styles change both.

## Run locally

```bash
npm install
npm start
```

`npm start` runs API and UI together. For one side only: `npm run dev --prefix server` or `npm run dev --prefix client`.

- App: [http://localhost:5173](http://localhost:5173)  
- API: [http://localhost:3001](http://localhost:3001)  
- After sessions are submitted, see aggregates at [http://localhost:5173/dashboard](http://localhost:5173/dashboard)

For real model replies, add `server/.env` with `OPENAI_API_KEY=sk-...` (or export it in your shell). Without a key, the server uses placeholders.

Optional: `OPENAI_MODEL` (default `gpt-4o-mini`), `REVEAL_MODE_TO_CLIENT=1` to expose the assistant mode to the UI, `DB_PATH`, `PORT`.

## What’s in the box

React (Vite) UI, Node/Express API, OpenAI chat completions, and SQLite for sessions. Each session picks a scenario and a hidden “mode” (supportive, neutral, or challenging) so you can compare outcomes without participants seeing the label.

REST endpoints: `/scenario`, `/chat`, `/submit`, `/stats`—duplicated under `/api/*`.
