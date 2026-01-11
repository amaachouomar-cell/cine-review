import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LS_KEY = "cine_side_cloud_closed_v1";

const SHOW_MS = 4500;   // يظهر 4.5 ثواني
const HIDE_MS = 55500;  // يختفي 55.5 ثانية

export default function SidePromos() {
  const location = useLocation();

  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [autoVisible, setAutoVisible] = useState(true); // للنبض التلقائي
  const [open, setOpen] = useState(false);              // popover

  useEffect(() => {
    setClosed(localStorage.getItem(LS_KEY) === "1");
    setMounted(true);
  }, []);

  // (اختياري) اخفاء في صفحات معينة
  const hiddenOn = useMemo(() => {
    const path = location?.pathname || "/";
    // مثال: اخفاء في صفحات التفاصيل كي لا يزعج
    // return path.startsWith("/movie/");
    return false;
  }, [location?.pathname]);

  // دورة الظهور/الاختفاء التلقائية (بدون إزعاج)
  useEffect(() => {
    if (!mounted || closed || hiddenOn) return;

    let showTimer;
    let loop;

    const cycle = () => {
      setAutoVisible(true);
      showTimer = setTimeout(() => setAutoVisible(false), SHOW_MS);
    };

    cycle();
    loop = setInterval(cycle, SHOW_MS + HIDE_MS);

    return () => {
      clearTimeout(showTimer);
      clearInterval(loop);
    };
  }, [mounted, closed, hiddenOn]);

  // اغلاق popover عند تغيير الصفحة
  useEffect(() => {
    setOpen(false);
  }, [location?.pathname]);

  if (!mounted || closed || hiddenOn) return null;

  const closeForever = () => {
    localStorage.setItem(LS_KEY, "1");
    setClosed(true);
  };

  // عندما تكون اللوحة مفتوحة: نظهر السحابة دائمًا (بدون اختفاء)
  const shouldShow = open ? true : autoVisible;

  return (
    <div className="fixed left-1 bottom-20 z-[9999]">
      {/* Bubble Cloud */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative",
          "w-11 h-11 rounded-full",
          "backdrop-blur-2xl",
          "border border-white/10",
          "bg-white/5 hover:bg-white/10",
          "shadow-[0_14px_40px_rgba(0,0,0,.45)]",
          "transition-all duration-300",
          "grid place-items-center",
          shouldShow ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none",
        ].join(" ")}
        aria-label="Open quick links"
        title="Quick"
      >
        {/* تأثير سحابة/ماء */}
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
        </span>

        {/* أيقونة */}
        <span className="relative text-white/85 text-[10px]">
          🫧
        </span>

        {/* نقطة إشعار خفيفة */}
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_0_3px_rgba(0,0,0,.35)] animate-pulse" />
      </button>

      {/* Popover صغير جدا */}
      <div
        className={[
          "mt-2",
          "w-[170px] max-w-[55vw]",
          "rounded-2xl border border-white/10",
          "bg-black/35 backdrop-blur-2xl",
          "shadow-[0_18px_55px_rgba(0,0,0,.6)]",
          "overflow-hidden",
          "transition-all duration-200",
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-1 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span className="text-[11px] font-semibold text-white/80">
            اكتشف المزيد
          </span>
          <button
            onClick={closeForever}
            className="text-[12px] px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition"
            title="إخفاء نهائي"
          >
            ✕
          </button>
        </div>

        <div className="p-2 flex flex-col gap-2">
          <CloudLink to="/blog" icon="📰" title="Blog" subtitle="مقالات مختارة" />
          <CloudLink to="/games" icon="🎮" title="Games" subtitle="ألعاب خفيفة" />
        </div>

        <div className="px-3 pb-3 text-[10px] text-white/45">
          تظهر أحيانًا فقط — بدون إزعاج.
        </div>
      </div>
    </div>
  );
}

function CloudLink({ to, icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="
        group flex items-center gap-2
        rounded-xl border border-white/10
        bg-white/5 hover:bg-white/10
        px-3 py-2 transition
      "
    >
      <span className="text-[15px]">{icon}</span>
      <span className="leading-tight">
        <span className="block text-[12px] font-semibold text-white">
          {title}
        </span>
        <span className="block text-[10px] text-white/60">
          {subtitle}
        </span>
      </span>
      <span className="ml-auto text-white/55 group-hover:text-white transition text-[14px]">
        ›
      </span>
    </Link>
  );
}
