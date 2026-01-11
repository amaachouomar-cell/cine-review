import { kv } from "@vercel/kv";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  const email = String(req.query.email || "").trim().toLowerCase();
  const sessionId = String(req.query.sessionId || "").trim();

  if (!email.includes("@") || sessionId.length < 8) {
    return json(res, 400, { ok: false, error: "Invalid params" });
  }

  const convoKey = `support:convo:${email}:${sessionId}`;
  const raw = await kv.lrange(convoKey, 0, 200);
  const messages = raw.map((x) => {
    try { return JSON.parse(x); } catch { return null; }
  }).filter(Boolean);

  return json(res, 200, { ok: true, messages });
}
