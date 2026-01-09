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

  // ✅ Close menus on route change
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // ✅ Main links
  const links = [
    { to: "/", label: t.home || "Home" },
    { to: "/trending", label: t.trending || "Trending" },
    { to: "/top-rated", label: t.topRated || "Top Rated" },
    { to: "/favorites", label: t.favorites || "Favorites" },
    { to: "/reviews", label: t.reviews || "Reviews" },
  ];

  // ✅ Legal links (Important for Adsense)
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
        <motion.header
          initial={{ y: -35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -35, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="sticky top-0 z-50"
        >
          {/* ✅ Navbar Container */}
          <div className="glass px-6 py-4 relative flex items-center justify-between border-b border-white/10">
            {/* ✅ Logo */}
            <NavLink
              to="/"
              className="text-xl font-extrabold tracking-wide z-10 select-none"
            >
              🎬 <span className="text-red-500">Cine</span>Review
            </NavLink>

            {/* ✅ Desktop Navigation */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 text-sm">
              {links.map((l) => (
                <NavItem key={l.to} to={l.to} label={l.label} />
              ))}

              {/* ✅ CTA Blog Button (BIG for AdSense) */}
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-2xl font-bold transition shadow-lg border ${
                    isActive
                      ? "bg-red-600 text-white border-red-500 shadow-red-500/25"
                      : "bg-red-600/90 text-white border-red-500/60 hover:bg-red-700 shadow-red-500/20"
                  }`
                }
              >
                📝 {t.blog || "Blog"}
              </NavLink>

              {/* ✅ Dropdown: Legal links */}
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
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 left-0 w-56 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-xl"
                    >
                      <div className="flex flex-col p-2">
                        <p className="text-xs text-gray-400 font-semibold px-4 py-2">
                          {t.legal || "Legal"}
                        </p>

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
            <div className="flex items-center gap-2 z-10">
              {/* ✅ Language Toggle */}
              <button
                onClick={toggleLang}
                className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold text-gray-200"
              >
                {lang === "ar" ? "English" : "العربية"}
              </button>

              {/* ✅ Mobile Menu Button */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden px-3 py-2 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition text-gray-200"
              >
                ☰
              </button>
            </div>
          </div>

          {/* ✅ Mobile Menu */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="md:hidden glass px-4 pb-4 pt-2 border-t border-white/10"
              >
                <div className="flex flex-col gap-2">
                  {/* ✅ Main links */}
                  {links.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-xl font-semibold transition border ${
                          isActive
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-zinc-900/40 text-gray-300 border-white/10 hover:bg-zinc-800 hover:text-white"
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}

                  {/* ✅ Blog CTA big mobile */}
                  <NavLink
                    to="/blog"
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-2xl font-bold transition border shadow-lg ${
                        isActive
                          ? "bg-red-600 text-white border-red-500"
                          : "bg-red-600/90 text-white border-red-500/60 hover:bg-red-700"
                      }`
                    }
                  >
                    📝 {t.blog || "Blog"}
                  </NavLink>

                  {/* ✅ Legal links */}
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">
                      {t.legal || "Legal"}
                    </p>

                    {legalLinks.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        className={({ isActive }) =>
                          `px-4 py-3 rounded-xl font-semibold transition border ${
                            isActive
                              ? "bg-red-600 text-white border-red-500"
                              : "bg-zinc-900/40 text-gray-300 border-white/10 hover:bg-zinc-800 hover:text-white"
                          }`
                        }
                      >
                        {l.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
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
