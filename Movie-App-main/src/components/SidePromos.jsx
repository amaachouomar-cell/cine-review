import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const LS_HIDE_KEY = "cine_sidepromo_hide_v2";

export default function SidePromos() {
  const navigate = useNavigate();

  // اشعارات خفيفة (عدل الروابط/النص كما تريد)
  const items = useMemo(
    () => [
      {
        id: "blog",
        title: "Blog",
        sub: "مقالات مختارة",
        cta: "اكتشف",
        to: "/blog",
        icon: "📰",
      },
      {
        id: "games",
        title: "Games",
        sub: "ألعاب خفيفة",
        cta: "جرّب",
        to: "/games",
        icon: "🎮",
      },
    ],
    []
  );

  // 60 ثانية ظهور
  const SHOW_MS = 60_000;
  // 3 ثواني انتقال/أنيميشن جميل
  const ENTER_MS = 250;
  // بعد ما يختفي.. يرجع بعد دقيقة (تقدر تخليه 2 دقائق)
  const REAPPEAR_MS = 60_000;

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hiddenForever, setHiddenForever] = useState(false);

  useEffect(() => {
    const hide = localStorage.getItem(LS_HIDE_KEY) === "1";
    setHiddenForever(hide);
    if (!hide) setOpen(true);
  }, []);

  // دورة الظهور/الاختفاء تلقائياً
  useEffect(() => {
    if (hiddenForever) return;

    let t1, t2;

    // يختفي بعد دقيقة
    if (open) {
      t1 = setTimeout(() => setOpen(false), SHOW_MS);
    } else {
      // يرجع بعد دقيقة
      t2 = setTimeout(() => {
        setIndex((p) => (p + 1) % items.length); // يبدل إشعار
        setOpen(true);
      }, REAPPEAR_MS);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, hiddenForever, items.length]);

  if (hiddenForever) return null;

  const it = items[index];

  const go = () => navigate(it.to);

  const close = () => setOpen(false);

  const hideForever = () => {
    localStorage.setItem(LS_HIDE_KEY, "1");
    setHiddenForever(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 5,
        bottom: 12,
        zIndex: 9999,
        pointerEvents: "none", // مهم: ما يغطيش الصفحة
      }}
    >
      <div
        style={{
          pointerEvents: "auto", // فقط الشريط قابل للضغط
          transform: open ? "translateY(0px)" : "translateY(90px)",
          opacity: open ? 1 : 0,
          transition: `transform ${ENTER_MS}ms ease, opacity ${ENTER_MS}ms ease`,
          width: "min(320px, calc(100vw - 20px))",
          height: 22, // شريط رقيق
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
        }}
        aria-label="promo-notification"
      >
        {/* أيقونة صغيرة */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.10)",
            flex: "0 0 auto",
          }}
        >
          <span style={{ fontSize: 16 }}>{it.icon}</span>
        </div>

        {/* نص خفيف */}
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {it.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {it.sub}
          </div>
        </div>

        {/* زر CTA صغير */}
        <button
          onClick={go}
          style={{
            height: 30,
            padding: "0 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {it.cta}
        </button>

        {/* زر إغلاق */}
        <button
          onClick={close}
          title="إغلاق"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.20)",
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "30px",
          }}
        >
          ×
        </button>

        {/* زر: لا تظهر مرة أخرى (اختياري) */}
        <button
          onClick={hideForever}
          title="لا تظهر مرة أخرى"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.12)",
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ⦸
        </button>
      </div>
    </div>
  );
}
