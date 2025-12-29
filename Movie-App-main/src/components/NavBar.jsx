import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const { lang, toggleLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const hideNavbar = location.pathname.startsWith("/movie/");

  const links = [
    { to: "/", label: t.home },
    { to: "/trending", label: t.trending },
    { to: "/top-rated", label: t.topRated },
    { to: "/favorites", label: t.favorites },
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
          <div className="glass px-6 py-4 relative flex items-center justify-between">
            {/* ✅ Logo */}
            <NavLink to="/" className="text-xl font-bold tracking-wide z-10">
              🎬 <span className="text-red-500">Cine</span>Review
            </NavLink>

            {/* ✅ Center Links Desktop */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 text-sm">
              {links.map((l) => (
                <NavItem key={l.to} to={l.to} label={l.label} />
              ))}
            </nav>

            {/* ✅ Right Actions */}
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={toggleLang}
                className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold text-gray-200"
              >
                {lang === "ar" ? "English" : "العربية"}
              </button>

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
                  {links.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
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
