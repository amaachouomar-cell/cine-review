import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "مرحبًا 👋 كيف نساعدك؟" },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [open, messages.length]);

  const send = () => {
    const t = msg.trim();
    if (!t) return;
    setMessages((prev) => [...prev, { from: "user", text: t }]);
    setMsg("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "وصلت ✅ سنرد عليك قريبًا." },
      ]);
    }, 600);
  };

  return (
    <>
      {/* ✅ زر عائم أسفل يمين */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 999999,
        }}
        className="h-[54px] w-[54px] rounded-full border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex items-center justify-center"
        aria-label="Support Chat"
      >
        <span className="text-xl">💬</span>
      </button>

      {/* ✅ نافذة الشات */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              right: 18,
              bottom: 80,
              zIndex: 999999,
            }}
            className="w-[320px] max-w-[92vw] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
            dir="rtl"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="text-white font-semibold text-sm">
                الدعم — CineReview
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-white/80 text-lg"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div
              ref={listRef}
              className="px-4 py-3 max-h-[300px] overflow-auto"
            >
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.from === "user" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] text-[13px] rounded-2xl px-3 py-2 border whitespace-pre-wrap ${
                        m.from === "user"
                          ? "bg-red-600/20 border-red-500/20 text-white"
                          : "bg-white/5 border-white/10 text-white/90"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 outline-none"
                />
                <button
                  onClick={send}
                  className="h-[40px] px-4 rounded-2xl bg-red-600 hover:bg-red-500 transition text-white text-sm"
                >
                  إرسال
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
