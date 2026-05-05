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

## Third-party software & APIs

The following externally maintained libraries and hosted APIs are used (not authored in this repo). `npm install` also resolves **transitive** dependencies—the full tree and versions are pinned in [`package-lock.json`](package-lock.json).

| Source | Role |
|--------|------|
| [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) | Hosted LLM; used via the [`openai`](https://www.npmjs.com/package/openai) npm package on the server |
| **`client` npm packages** | [`react`](https://www.npmjs.com/package/react), [`react-dom`](https://www.npmjs.com/package/react-dom), [`react-router-dom`](https://www.npmjs.com/package/react-router-dom); dev: [`vite`](https://www.npmjs.com/package/vite), [`@vitejs/plugin-react`](https://www.npmjs.com/package/@vitejs/plugin-react) |
| **`server` npm packages** | [`express`](https://www.npmjs.com/package/express), [`cors`](https://www.npmjs.com/package/cors), [`dotenv`](https://www.npmjs.com/package/dotenv), [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3), [`openai`](https://www.npmjs.com/package/openai), [`uuid`](https://www.npmjs.com/package/uuid) |
| **Root npm package** | [`concurrently`](https://www.npmjs.com/package/concurrently) (runs API + UI together in dev) |

Node.js built-in modules (`fs`, `path`, etc.) ship with the runtime, not this project.
