import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const PROMOS = [
  {
    id: "blog",
    title: "📚 المدونة",
    desc: "مقالات قصيرة عن أفضل الأفلام + توصيات.",
    cta: "اذهب للمدونة",
    to: "/blog",
    badge: "New",
  },
  {
    id: "quiz",
    title: "🧠 اختبار الأفلام",
    desc: "اختبر معلوماتك وشارك نتيجتك!",
    cta: "ابدأ الاختبار",
    to: "/quiz",
    badge: "Hot",
  },
  {
    id: "cinematch",
    title: "🎬 CineMatch",
    desc: "لعبة الذاكرة بمؤثرات فخمة ومستويات.",
    cta: "العب الآن",
    to: "/cine-match",
    badge: "Pro",
  },
  {
    id: "games",
    title: "🎮 الألعاب",
    desc: "كل الألعاب في صفحة واحدة.",
    cta: "استكشف الألعاب",
    to: "/games",
    badge: "Top",
  },
];

export default function SidePromos() {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // لا تظهر في صفحات التفاصيل حتى لا تزعج
  const disabled = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/movie/") || p.startsWith("/games/");
  }, [location.pathname]);

  useEffect(() => {
    if (!open || disabled) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % PROMOS.length);
    }, 7000);
    return () => clearInterval(t);
  }, [open, disabled]);

  if (disabled) return null;

  const promo = PROMOS[index];

  const go = () => {
    setOpen(false);
    setTimeout(() => {
      navigate(promo.to);
      setTimeout(() => setOpen(true), 300);
    }, 120);
  };

  return (
    <>
      {/* Desktop: side floating */}
      <div className="hidden md:block">
        <AnimatePresence>
          {open && (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed z-50 right-4 top-28 w-[290px]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                {/* glow */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-red-500/25 to-blue-500/15 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/15 blur-2xl" />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-[15px]">
                          {promo.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                          {promo.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-white/70 text-[12px] leading-relaxed">
                        {promo.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => setOpen(false)}
                      className="text-white/60 hover:text-white transition text-sm"
                      aria-label="close"
                      title="إغلاق"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={go}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white text-[12px] font-semibold hover:opacity-95 active:scale-[0.98] transition"
                    >
                      {promo.cta} →
                    </button>

                    <div className="flex gap-1">
                      {PROMOS.map((p, i) => (
                        <span
                          key={p.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i === index ? "bg-white" : "bg-white/25"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: bottom mini bar */}
      <div className="md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              key={"m-" + promo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed z-50 left-3 right-3 bottom-3"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-bold text-[13px] truncate">
                      {promo.title}
                    </div>
                    <div className="text-white/70 text-[11px] truncate">
                      {promo.desc}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={go}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white text-[12px] font-semibold"
                    >
                      {promo.cta}
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-white/70"
                      aria-label="close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
