import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LS_KEY = "cine_side_promos_closed_v2";

// توقيت الظهور/الاختفاء
const SHOW_MS = 6000;   // يظهر 6 ثواني
const HIDE_MS = 54000;  // يختفي 54 ثانية (المجموع ~ 60s)

export default function SidePromos() {
  const location = useLocation();

  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // للتحكم بالظهور/الإخفاء التلقائي
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setClosed(localStorage.getItem(LS_KEY) === "1");
    setMounted(true);
  }, []);

  // اختياري: إخفاء في صفحات معينة
  const hiddenOn = useMemo(() => {
    const path = location?.pathname || "/";
    return false;
    // مثال:
    // return path.startsWith("/admin");
  }, [location?.pathname]);

  // دورة الظهور/الاختفاء
  useEffect(() => {
    if (!mounted || closed || hiddenOn) return;

    let showTimer;
    let hideTimer;
    let loopInterval;

    const cycle = () => {
      setVisible(true);
      showTimer = setTimeout(() => setVisible(false), SHOW_MS);
    };

    cycle();
    loopInterval = setInterval(cycle, SHOW_MS + HIDE_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(loopInterval);
    };
  }, [mounted, closed, hiddenOn]);

  if (!mounted || closed || hiddenOn) return null;

  const close = () => {
    localStorage.setItem(LS_KEY, "1");
    setClosed(true);
  };

  return (
    <div className="fixed left-3 bottom-20 z-[9999]">
      {/* Mini FAB (دائمًا موجود) */}
      <button
        onClick={() => setVisible((v) => !v)}
        className="
          group
          w-10 h-10 rounded-full
          bg-white/5 hover:bg-white/10
          border border-white/10
          backdrop-blur-xl
          shadow-[0_10px_30px_rgba(0,0,0,.45)]
          grid place-items-center
          text-white/90
          transition
        "
        aria-label="إظهار/إخفاء الإشهار"
        title="اكتشف"
      >
        <span className="text-[16px]">✨</span>
      </button>

      {/* Panel */}
      <div
        className={[
          "mt-2",
          "pointer-events-auto",
          "rounded-2xl border border-white/10",
          "bg-gradient-to-b from-black/65 to-black/45",
          "backdrop-blur-xl",
          "shadow-[0_14px_50px_rgba(0,0,0,.55)]",
          "overflow-hidden",
          "w-[160px] max-w-[46vw]",
          "transition-all duration-300",
          visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-2 scale-95 pointer-events-none",
        ].join(" ")}
      >
        {/* top bar */}
        <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white/70 animate-pulse" />
            <span className="text-[11px] text-white/80 font-semibold tracking-wide">
              جديد بالموقع
            </span>
          </div>

          <button
            onClick={close}
            className="
              w-7 h-7 grid place-items-center
              rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10
              text-white/80 hover:text-white
              transition
            "
            aria-label="إغلاق نهائي"
            title="إغلاق نهائي"
          >
            ✕
          </button>
        </div>

        {/* content */}
        <div className="p-2 flex flex-col gap-2">
          <Link
            to="/blog"
            className="
              group flex items-center justify-between
              rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10
              px-3 py-2 transition
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-[15px]">📰</span>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-white">المدونة</div>
                <div className="text-[10px] text-white/65">مقالات وتوصيات</div>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white transition text-[14px]">›</span>
          </Link>

          <Link
            to="/games"
            className="
              group flex items-center justify-between
              rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10
              px-3 py-2 transition
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-[15px]">🎮</span>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-white">الألعاب</div>
                <div className="text-[10px] text-white/65">خفيفة وممتعة</div>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white transition text-[14px]">›</span>
          </Link>

          <div className="text-[10px] text-white/50 px-1 pt-1">
            تظهر لثواني فقط بدون إزعاج.
          </div>
        </div>
      </div>
    </div>
  );
}
