import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LS_KEY = "cine_sidepromos_dismiss_v2";

export default function SidePromos() {
  const location = useLocation();

  // لا نظهره في صفحات معينة (اختياري)
  const hideOnRoutes = ["/admin", "/login"];
  const shouldHide = hideOnRoutes.some((p) => location.pathname.startsWith(p));

  const items = useMemo(
    () => [
      {
        id: "blog",
        title: "Blog",
        subtitle: "مقالات مختارة",
        icon: "📰",
        to: "/blog",
      },
      {
        id: "games",
        title: "Games",
        subtitle: "ألعاب خفيفة",
        icon: "🎮",
        to: "/games",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const timers = useRef({ show: null, hide: null, next: null });

  const dismissed = useMemo(() => {
    try {
      return localStorage.getItem(LS_KEY) === "1";
    } catch {
      return false;
    }
  }, []);

  // إعدادات الظهور (خفيفة وغير مزعجة)
  const SHOW_FOR_MS = 3800; // مدة الظهور
  const WAIT_BETWEEN_MS = 32000; // مدة الاختفاء بين كل إشعار (حوالي نصف دقيقة)
  const FIRST_DELAY_MS = 2500; // أول مرة بعد دخول الصفحة

  useEffect(() => {
    if (dismissed || shouldHide) return;

    const clearAll = () => {
      const t = timers.current;
      if (t.show) clearTimeout(t.show);
      if (t.hide) clearTimeout(t.hide);
      if (t.next) clearTimeout(t.next);
      timers.current = { show: null, hide: null, next: null };
    };

    const cycle = (delayMs) => {
      clearAll();

      timers.current.show = setTimeout(() => {
        setVisible(true);

        timers.current.hide = setTimeout(() => {
          setVisible(false);

          timers.current.next = setTimeout(() => {
            setIndex((i) => (i + 1) % items.length);
            cycle(700); // يرجع بسرعة بسيطة
          }, WAIT_BETWEEN_MS);
        }, SHOW_FOR_MS);
      }, delayMs);
    };

    cycle(FIRST_DELAY_MS);

    return () => clearAll();
  }, [dismissed, shouldHide, items.length]);

  if (dismissed || shouldHide) return null;

  const item = items[index];

  const dismissForever = () => {
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {}
    setVisible(false);
  };

  return (
    <>
      {/* Toast */}
      <div
        className={[
          "fixed z-[70] left-3 bottom-24 md:bottom-6",
          "pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            // حركة لطيفة: يظهر/يختفي + سلاسة
            "transition-all duration-500 ease-out",
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-3 scale-[0.98]",
          ].join(" ")}
          style={{
            // نخليه صغير جدًا ومايغطي شيء
            width: "min(270px, 78vw)",
            pointerEvents: visible ? "auto" : "none",
          }}
        >
          <div
            className={[
              "relative overflow-hidden rounded-2xl",
              "border border-white/10",
              "bg-white/[0.06] backdrop-blur-xl",
              "shadow-[0_18px_70px_rgba(0,0,0,0.45)]",
            ].join(" ")}
          >
            {/* لمعة/سحابة مائية */}
            <div
              className="absolute -inset-10 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.16), transparent 55%), radial-gradient(circle at 80% 20%, rgba(0,180,255,0.14), transparent 52%), radial-gradient(circle at 30% 85%, rgba(255,0,90,0.10), transparent 55%)",
                filter: "blur(14px)",
                animation: "cineFloat 6.5s ease-in-out infinite",
              }}
            />

            <div className="relative px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full grid place-items-center border border-white/10 bg-white/5"
                  aria-hidden="true"
                >
                  <span className="text-lg">{item.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-white/90 leading-5 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-white/60 truncate">
                    {item.subtitle}
                  </div>
                </div>

                {/* إغلاق */}
                <button
                  onClick={() => setVisible(false)}
                  className="h-8 w-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 grid place-items-center"
                  title="إغلاق"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Link
                  to={item.to}
                  className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-[12px] font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-white/90"
                >
                  اكتشف الآن →
                </Link>

                <button
                  onClick={dismissForever}
                  className="text-[11px] text-white/55 hover:text-white/80 underline underline-offset-4"
                  title="عدم الإظهار مرة أخرى"
                >
                  لا تظهر مرة أخرى
                </button>
              </div>
            </div>

            {/* شريط صغير للتقدم (اختياري) */}
            <div className="relative h-[2px] bg-white/5 overflow-hidden">
              <div
                className="h-full bg-white/30"
                style={{
                  width: visible ? "100%" : "0%",
                  transition: visible ? `width ${SHOW_FOR_MS}ms linear` : "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes cineFloat {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(0,-6px,0) scale(1.02); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
      `}</style>
    </>
  );
}
