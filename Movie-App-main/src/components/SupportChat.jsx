import React, { useEffect, useMemo, useRef, useState } from "react";

function makeSessionId() {
  const key = "support_session_id";
  let v = localStorage.getItem(key);
  if (!v) {
    v = `${Date.now()}_${Math.random().toString(16).slice(2)}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, v);
  }
  return v;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem("support_email") || "");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const sessionId = useMemo(() => makeSessionId(), []);
  const boxRef = useRef(null);

  useEffect(() => {
    if (email) localStorage.setItem("support_email", email);
  }, [email]);

  async function loadThread() {
    if (!email.includes("@")) return;
    const r = await fetch(`/api/support/thread?email=${encodeURIComponent(email)}&sessionId=${encodeURIComponent(sessionId)}`);
    const data = await r.json();
    if (data?.ok) setMessages(data.messages || []);
  }

  useEffect(() => {
    if (!open) return;
    loadThread();
    const t = setInterval(loadThread, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, email]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      boxRef.current?.scrollTo?.({ top: boxRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [messages, open]);

  async function send() {
    if (!email.includes("@")) return alert("أدخل بريدك الإلكتروني أولاً");
    if (!msg.trim()) return;

    const payload = { email, sessionId, message: msg.trim() };
    setMsg("");

    const r = await fetch("/api/support/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!data?.ok) alert(data?.error || "حدث خطأ");
    await loadThread();
  }

  return (
    <>
      {/* زر عائم */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: 52,
          height: 52,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(20,20,20,0.9)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          zIndex: 9999,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
        }}
        aria-label="Support chat"
        title="الدعم"
      >
        💬
      </button>

      {/* نافذة الشات */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 76,
          width: 320,
          maxWidth: "calc(100vw - 32px)",
          height: open ? 420 : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(10px)",
          transition: "all 220ms ease",
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,12,0.92)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
          zIndex: 9999,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700 }}>الدعم</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, color: "#fff", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 12, display: "grid", gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الإلكتروني"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              outline: "none",
            }}
          />

          <div
            ref={boxRef}
            style={{
              height: 250,
              overflow: "auto",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              padding: 10,
              display: "grid",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ opacity: 0.7, fontSize: 13 }}>اكتب رسالتك وسنرد عليك هنا.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    justifySelf: m.from === "user" ? "end" : "start",
                    maxWidth: "85%",
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: m.from === "user" ? "rgba(220,38,38,0.25)" : "rgba(59,130,246,0.18)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                    lineHeight: 1.35,
                  }}
                >
                  {m.message}
                  <div style={{ opacity: 0.6, fontSize: 10, marginTop: 4 }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="اكتب رسالتك..."
              onKeyDown={(e) => e.key === "Enter" && send()}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(220,38,38,0.9)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
