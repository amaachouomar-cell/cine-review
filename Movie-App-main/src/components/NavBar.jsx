import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const { lang, toggleLang, t } = useLang();

  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const hideNavbar = location.pathname.startsWith("/movie/");

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: t.home },
    { to: "/trending", label: t.trending },
    { to: "/top-rated", label: t.topRated },
    { to: "/favorites", label: t.favorites },
    { to: "/reviews", label: t.reviews },
    { to: "/blog", label: t.blog || "Blog" },
    { to: "/quiz", label: t.quiz || "Quiz" },
    { to: "/game", label: t.game || "Game" },


  ];

  const legalLinks = [
    { to: "/about", label: t.about || "About" },
    { to: "/contact", label: t.contact || "Contact" },
    { to: "/privacy-policy", label: t.privacy || "Privacy Policy" },
    { to: "/terms", label: t.terms || "Terms" },
    { to: "/faq", label: t.faq || "FAQ" },
    { to: "/guidelines", label: t.guidelines || "Guidelines" },
  ];

  return (
    <AnimatePresence>
      {!hideNavbar && (
        <>
          {/* ✅ Top Navbar */}
          <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="sticky top-0 z-[999] w-full"
          >
            <div className="px-4 md:px-8 py-4 bg-zinc-950/70 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
              {/* ✅ Logo */}
              <NavLink
                to="/"
                className="text-xl font-extrabold tracking-wide flex items-center gap-2"
              >
                🎬 <span className="text-red-500">Cine</span>Review
              </NavLink>

              {/* ✅ Desktop Links */}
              <nav className="hidden md:flex items-center gap-2 text-sm">
                {links.map((l) => (
                  <NavItem key={l.to} to={l.to} label={l.label} />
                ))}

                {/* ✅ Desktop Dropdown (More) */}
                <div className="relative">
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className="px-4 py-2 rounded-xl font-semibold transition border bg-zinc-900/40 text-gray-300 border-white/10 hover:bg-zinc-800 hover:text-white"
                  >
                    {t.more || "More"} ▾
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-60 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl"
                      >
                        <div className="flex flex-col p-2 gap-1">
                          {legalLinks.map((l) => (
                            <NavLink
                              key={l.to}
                              to={l.to}
                              className={({ isActive }) =>
                                `px-4 py-3 rounded-xl font-semibold transition ${
                                  isActive
                                    ? "bg-red-600 text-white"
                                    : "text-gray-300 hover:bg-zinc-900 hover:text-white"
                                }`
                              }
                            >
                              {l.label}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* ✅ Right Actions */}
              <div className="flex items-center gap-2">
                {/* ✅ Language Toggle */}
                <button
                  onClick={toggleLang}
                  className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold text-gray-200 text-sm"
                >
                  {lang === "ar" ? "English" : "العربية"}
                </button>

                {/* ✅ Mobile Menu Button */}
                <button
                  onClick={() => setOpen(true)}
                  className="md:hidden px-3 py-2 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition text-gray-200 text-lg"
                >
                  ☰
                </button>
              </div>
            </div>
          </motion.header>

          {/* ✅ Mobile Drawer Overlay */}
          <AnimatePresence>
            {open && (
              <>
                {/* Background overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/70 z-[998]"
                />

                {/* Drawer Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3 }}
                  className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-zinc-950 z-[999] border-l border-white/10 p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">
                      🎬 Cine<span className="text-red-500">Review</span>
                    </h2>

                    <button
                      onClick={() => setOpen(false)}
                      className="text-gray-300 hover:text-white text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ✅ Main Links */}
                  <div className="space-y-2">
                    {links.map((l) => (
                      <MobileLink key={l.to} to={l.to} label={l.label} />
                    ))}
                  </div>

                  {/* ✅ Divider */}
                  <div className="my-6 border-t border-white/10" />

                  {/* ✅ Legal Links */}
                  <h3 className="text-sm font-bold text-gray-400 mb-3">
                    {t.legal || "Legal"}
                  </h3>

                  <div className="space-y-2">
                    {legalLinks.map((l) => (
                      <MobileLink key={l.to} to={l.to} label={l.label} />
                    ))}
                  </div>

                  {/* ✅ Footer */}
                  <p className="text-xs text-gray-500 mt-8 text-center">
                    © {new Date().getFullYear()} CineReview
                  </p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-xl font-semibold transition border ${
          isActive
            ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20"
            : "bg-zinc-900/40 text-gray-300 border-white/10 hover:bg-zinc-800 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function MobileLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-2xl font-semibold transition border ${
          isActive
            ? "bg-red-600 text-white border-red-500"
            : "bg-zinc-900/40 text-gray-300 border-white/10 hover:bg-zinc-800 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
