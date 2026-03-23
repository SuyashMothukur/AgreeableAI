# Sentiment Alignment Study (MVP)

Full-stack prototype for controlled experiments comparing **user-reported support** with **heuristic sentiment alignment** between user messages and assistant replies.

## Stack

- **Frontend:** React (Vite), minimal CSS
- **Backend:** Node.js, Express
- **LLM:** OpenAI Chat Completions (`OPENAI_API_KEY`), with placeholder responses if unset
- **Storage:** SQLite (`server/data/sessions.db`)

## Run locally

From the repo root, install dependencies once, then start the API and UI together:

```bash
npm install
npm start
```

- API: [http://localhost:3001](http://localhost:3001)
- App: [http://localhost:5173](http://localhost:5173)

`npm start` and `npm run dev` are the same (both run the stack). To run only one side, use `npm run dev --prefix server` or `npm run dev --prefix client`.

Set `OPENAI_API_KEY` in the environment (or a `server/.env` loaded manually — the server reads `process.env` only; export in the shell or use your process manager).

Optional:

- `OPENAI_MODEL` — default `gpt-4o-mini`
- `REVEAL_MODE_TO_CLIENT=1` — include assigned behavior mode in `GET /scenario` (normally hidden for blind studies)
- `DB_PATH` — custom SQLite file path

## API

| Method | Path | Description |
|--------|------|---------------|
| GET | `/scenario` | New session: random scenario + random mode (mode omitted unless `REVEAL_MODE_TO_CLIENT=1`) |
| POST | `/chat` | `{ sessionId, content }` → assistant reply |
| POST | `/submit` | `{ sessionId, survey }` → persist session + survey + disparity label |
| GET | `/stats` | Aggregate alignment % and avg satisfaction by mode |

Duplicate `/api/*` routes exist for convenience.

## Behavior modes (stored, not shown to participants)

- **supportive** — mirror tone, validate
- **neutral** — balanced, low arousal
- **challenging** — gentle pushback

## Dashboard

Open [http://localhost:5173/dashboard](http://localhost:5173/dashboard) for simple aggregates after sessions are submitted.
