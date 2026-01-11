import { kv } from "@vercel/kv";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  const token = String(req.headers["x-admin-token"] || "");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

  // نجمع كل index keys عبر scan بسيط
  // Vercel KV يدعم kv.scan
  const keys = await kv.scan(0, { match: "support:index:*", count: 200 });
  const list = [];

  for (const k of keys[1] || []) {
    const v = await kv.get(k);
    if (v) {
      try { list.push(JSON.parse(v)); } catch {}
    }
  }

  list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return json(res, 200, { ok: true, list });
}
