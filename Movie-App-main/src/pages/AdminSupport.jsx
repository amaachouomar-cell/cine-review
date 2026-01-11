import React, { useEffect, useState } from "react";

export default function AdminSupport() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    localStorage.setItem("admin_token", token);
  }, [token]);

  async function loadList() {
    const r = await fetch("/api/admin/support/list", {
      headers: { "x-admin-token": token },
    });
    const data = await r.json();
    if (data?.ok) setList(data.list || []);
  }

  async function loadThread(email, sessionId) {
    const r = await fetch(`/api/support/thread?email=${encodeURIComponent(email)}&sessionId=${encodeURIComponent(sessionId)}`);
    const data = await r.json();
    if (data?.ok) setThread(data.messages || []);
  }

  async function sendReply() {
    if (!active) return;
    if (!reply.trim()) return;

    const r = await fetch("/api/admin/support/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ email: active.email, sessionId: active.sessionId, message: reply.trim() }),
    });

    const data = await r.json();
    if (!data?.ok) return alert(data?.error || "خطأ");

    setReply("");
    await loadThread(active.email, active.sessionId);
    await loadList();
  }

  useEffect(() => {
    if (!token) return;
    loadList();
    const t = setInterval(loadList, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h2>Support Inbox</h2>

      <div style={{ margin: "12px 0" }}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          style={{ width: 320, padding: 10, borderRadius: 10 }}
        />
        <button onClick={loadList} style={{ marginLeft: 8, padding: 10, borderRadius: 10 }}>
          Load
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 10, height: 500, overflow: "auto" }}>
          {list.map((c) => (
            <button
              key={`${c.email}:${c.sessionId}`}
              onClick={async () => {
                setActive(c);
                await loadThread(c.email, c.sessionId);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #333",
                background: active?.email === c.email ? "#222" : "transparent",
                color: "#fff",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{c.email}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{c.updatedAt}</div>
            </button>
          ))}
        </div>

        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 10, height: 500, display: "flex", flexDirection: "column" }}>
          {!active ? (
            <div style={{ opacity: 0.7 }}>اختر محادثة من اليسار</div>
          ) : (
            <>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>{active.email}</div>

              <div style={{ flex: 1, overflow: "auto", border: "1px solid #333", borderRadius: 10, padding: 10 }}>
                {thread.map((m) => (
                  <div key={m.id} style={{ marginBottom: 10, textAlign: m.from === "admin" ? "right" : "left" }}>
                    <div style={{ display: "inline-block", padding: 10, borderRadius: 12, background: m.from === "admin" ? "#1d4ed8" : "#991b1b" }}>
                      {m.message}
                    </div>
                    <div style={{ opacity: 0.6, fontSize: 11, marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="اكتب ردك..."
                  style={{ flex: 1, padding: 10, borderRadius: 10 }}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                />
                <button onClick={sendReply} style={{ padding: 10, borderRadius: 10 }}>
                  Reply
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
