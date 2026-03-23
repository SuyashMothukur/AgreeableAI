async function parseJson(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function fetchScenario() {
  const res = await fetch("/scenario");
  return parseJson(res);
}

export async function sendChat(sessionId, content) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, content }),
  });
  return parseJson(res);
}

export async function submitSession(sessionId, survey) {
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, survey }),
  });
  return parseJson(res);
}

export async function fetchStats() {
  const res = await fetch("/stats");
  return parseJson(res);
}
