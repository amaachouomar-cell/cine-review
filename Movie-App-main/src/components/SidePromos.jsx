import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LS_KEY = "cine_side_promos_closed_v1";

export default function SidePromos() {
  const location = useLocation();
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setClosed(localStorage.getItem(LS_KEY) === "1");
    setMounted(true);
  }, []);

  // لا تظهر داخل صفحات معيّنة إذا أردت (اختياري)
  const hiddenOn = useMemo(() => {
    const path = location?.pathname || "/";
    return false; // خليه false ليظهر في كل الصفحات
    // مثال لو تريد اخفاءه بصفحات معينة:
    // return path.startsWith("/admin") || path.startsWith("/login");
  }, [location?.pathname]);

  if (!mounted || closed || hiddenOn) return null;

  const close = () => {
    localStorage.setItem(LS_KEY, "1");
    setClosed(true);
  };

  return (
    <div
      className="
        fixed left-3 bottom-20 z-[9999]
        pointer-events-none
      "
      aria-label="Side promos"
    >
      {/* Container */}
      <div
        className="
          pointer-events-auto
          animate-[cineSlideIn_.45s_ease-out]
          rounded-2xl border border-white/10
          bg-black/55 backdrop-blur-xl
          shadow-[0_12px_40px_rgba(0,0,0,.45)]
          px-2 py-2
          w-[170px] max-w-[48vw]
        "
      >
        {/* Header tiny */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[11px] text-white/80 font-semibold tracking-wide">
            اكتشف المزيد
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
            aria-label="إغلاق"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Buttons (small, not blocking anything) */}
        <div className="flex flex-col gap-2">
          <Link
            to="/blog"
            className="
              group
              flex items-center justify-between
              rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10
              px-3 py-2
              transition
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-[16px]">📰</span>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-white">
                  المدونة
                </div>
                <div className="text-[10px] text-white/65">
                  مقالات قصيرة وتوصيات
                </div>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white transition text-[14px]">
              ›
            </span>
          </Link>

          <Link
            to="/games"
            className="
              group
              flex items-center justify-between
              rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10
              px-3 py-2
              transition
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-[16px]">🎮</span>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-white">
                  الألعاب
                </div>
                <div className="text-[10px] text-white/65">
                  ألعاب بسيطة وممتعة
                </div>
              </div>
            </div>
            <span className="text-white/60 group-hover:text-white transition text-[14px]">
              ›
            </span>
          </Link>
        </div>
      </div>

      {/* Keyframes بدون ملف CSS خارجي */}
      <style>{`
        @keyframes cineSlideIn {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}
