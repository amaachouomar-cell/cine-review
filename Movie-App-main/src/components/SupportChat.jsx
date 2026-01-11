import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ عدّل هذه البيانات كما تريد
const SUPPORT = {
  brand: "CineReview Support",
  status: "متصل الآن",
  welcome: "مرحبًا 👋 كيف يمكننا مساعدتك؟",
  // خيارات تواصل خارجية (اختياري)
  whatsappNumber: "212600000000", // مثال: 2126xxxxxxx بدون +
  email: "support@yourdomain.com",
  telegram: "yourTelegramUser", // بدون @
};

const STORAGE_KEY = "cine_support_chat_v1";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [
          {
            id: "w1",
            from: "bot",
            text: SUPPORT.welcome,
            ts: Date.now(),
          },
        ];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length
        ? parsed
        : [
            {
              id: "w1",
              from: "bot",
              text: SUPPORT.welcome,
              ts: Date.now(),
            },
          ];
    } catch {
      return [
        { id: "w1", from: "bot", text: SUPPORT.welcome, ts: Date.now() },
      ];
    }
  });

  // زر عائم قابل للسحب (يشبه “سحابة طائرة”)
  const [pos, setPos] = useState(() => {
    // موقع افتراضي أسفل يمين (مناسب للموبايل والكمبيوتر)
    return { x: 18, y: 110 }; // padding from right/bottom (px)
  });

  const listRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    // عند فتح الشات: صفّر الإشعارات ومرّر لآخر رسالة
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [open, messages.length]);

  const canSend = input.trim().length > 0;

  const actions = useMemo(() => {
    const wa =
      SUPPORT.whatsappNumber?.trim()
        ? `https://wa.me/${SUPPORT.whatsappNumber}`
        : null;
    const mail = SUPPORT.email?.trim()
      ? `mailto:${SUPPORT.email}?subject=${encodeURIComponent(
          "Support Request - CineReview"
        )}`
      : null;
    const tg = SUPPORT.telegram?.trim()
      ? `https://t.me/${SUPPORT.telegram.replace("@", "")}`
      : null;

    return [
      wa && { label: "واتساب", href: wa },
      tg && { label: "تيليجرام", href: tg },
      mail && { label: "إيميل", href: mail },
    ].filter(Boolean);
  }, []);

  function send() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");

    const userMsg = {
      id: `u_${Date.now()}`,
      from: "user",
      text,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // ✅ رد ذكي بسيط (بدون API)
    // يمكنك لاحقًا ربطه بخادم أو Firebase أو WhatsApp API… إلخ
    setTimeout(() => {
      const botMsg = {
        id: `b_${Date.now()}`,
        from: "bot",
        text:
          "وصلتني رسالتك ✅\nسنرد عليك بأقرب وقت. إذا تحب تواصل سريع استخدم واتساب من الأزرار.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (!open) setUnread((u) => u + 1);
    }, 650);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // حساب مكان النافذة بناءً على مكان الزر (حتى لا تغطي المحتوى)
  const panelStyle = {
    right: `${pos.x}px`,
    bottom: `${pos.y + 76}px`,
  };

  return (
    <>
      {/* ✅ الزر الطائر */}
      <motion.button
        aria-label="Support Chat"
        drag
        dragMomentum={false}
        dragElastic={0.08}
        onDragEnd={(e, info) => {
          // نثبت مكانه على الشاشة بشكل بسيط
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          // info.point يعطي إحداثيات بالصفحة، نحولها ل padding من اليمين/الأسفل
          const pxFromLeft = info.point.x;
          const pyFromTop = info.point.y;

          // حجم الزر تقريبًا 54
          const xFromRight = clamp(vw - pxFromLeft - 27, 12, vw - 72);
          const yFromBottom = clamp(vh - pyFromTop - 27, 12, vh - 72);

          setPos({ x: xFromRight, y: yFromBottom });
        }}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "fixed",
          right: pos.x,
          bottom: pos.y,
          zIndex: 9999,
        }}
        className="group relative h-[54px] w-[54px] rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        {/* هالة فخمة */}
        <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-tr from-red-500/0 via-white/5 to-red-500/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* أيقونة */}
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="h-[40px] w-[40px] rounded-full bg-gradient-to-br from-white/10 to-white/0 flex items-center justify-center">
            {/* أيقونة محادثة SVG */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-90"
            >
              <path
                d="M7.5 19.5 4 20l.5-3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 12c0 4.418-4.03 8-9 8-1.41 0-2.74-.29-3.91-.81"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 12c0-4.418 4.03-8 9-8s9 3.582 9 8c0 1.43-.42 2.77-1.15 3.93"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 12h.01M12 12h.01M16 12h.01"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* نقطة إشعار */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center shadow"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ✅ نافذة الشات */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              ...panelStyle,
              zIndex: 9999,
            }}
            className="w-[320px] max-w-[92vw] rounded-2xl border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500/40 to-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/90 text-sm">💬</span>
                </div>
                <div className="leading-tight">
                  <div className="text-white font-semibold text-sm">
                    {SUPPORT.brand}
                  </div>
                  <div className="text-white/60 text-[12px]">
                    {SUPPORT.status}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                aria-label="Close"
              >
                <span className="text-white/80 text-lg">×</span>
              </button>
            </div>

            {/* Quick actions */}
            {actions.length > 0 && (
              <div className="px-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  {actions.map((a) => (
                    <a
                      key={a.label}
                      href={a.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/80"
                    >
                      {a.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              ref={listRef}
              className="px-4 py-3 max-h-[320px] overflow-auto"
            >
              <div className="space-y-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.from === "user" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap text-[13px] leading-relaxed rounded-2xl px-3 py-2 border ${
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

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-white/20"
                />
                <button
                  onClick={send}
                  disabled={!canSend}
                  className="h-[40px] px-4 rounded-2xl bg-red-600 hover:bg-red-500 transition text-white text-sm disabled:opacity-40 disabled:hover:bg-red-600"
                >
                  إرسال
                </button>
              </div>

              <div className="mt-2 text-[11px] text-white/35">
                لا يشوّش على الموقع — افتحه فقط عند الحاجة.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
