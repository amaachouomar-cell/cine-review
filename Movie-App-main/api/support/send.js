import { kv } from "@vercel/kv";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false });

  const { email, sessionId, message } = req.body || {};
  const e = String(email || "").trim().toLowerCase();
  const s = String(sessionId || "").trim();
  const m = String(message || "").trim();

  if (!e.includes("@") || s.length < 8 || m.length < 1) {
    return json(res, 400, { ok: false, error: "Invalid data" });
  }

  const convoKey = `support:convo:${e}:${s}`;
  const indexKey = `support:index:${e}`;

  const item = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    from: "user",
    email: e,
    sessionId: s,
    message: m.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  await kv.rpush(convoKey, JSON.stringify(item));
  await kv.set(indexKey, JSON.stringify({ email: e, sessionId: s, updatedAt: item.createdAt }));

  return json(res, 200, { ok: true });
}
