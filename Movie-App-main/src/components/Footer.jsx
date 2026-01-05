import { Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import { motion } from "framer-motion";

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="mt-16 border-t border-white/10 bg-zinc-950/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-10 ${
            lang === "ar" ? "text-right" : "text-left"
          }`}
        >
          {/* ✅ Brand */}
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold tracking-wide">
              🎬 <span className="text-red-500">Cine</span>Review
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed">
              {t?.footerDesc ||
                "A modern platform to discover movies, rate them, and share your opinion with a smooth premium experience."}
            </p>

            <p className="text-gray-500 text-xs leading-relaxed">
              {t?.tmdbNote ||
                "This product uses the TMDB API but is not endorsed or certified by TMDB."}
            </p>
          </div>

          {/* ✅ Links */}
          <div className="space-y-3">
            <h3 className="text-white font-bold">
              {t?.footerLinks || "Links"}
            </h3>

         <div className="flex flex-col gap-2 text-sm">
  <FooterLink to="/about" label={t?.about || "About"} />
  <FooterLink to="/contact" label={t?.contact || "Contact"} />
  <FooterLink to="/privacy-policy" label={t?.privacy || "Privacy Policy"} />
  <FooterLink to="/terms" label={t?.terms || "Terms"} />

</div>

          </div>

          {/* ✅ Support / Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-bold">
              {t?.footerSupport || "Support"}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed">
              {t?.footerSupportDesc ||
                "Want to support this project? Share the website with your friends or send feedback!"}
            </p>

            {/* ✅ Email from translation (so it can change later easily) */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`mailto:${t?.contactEmail || "cine.review.contact@gmail.com"}`}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg text-sm"
            >
              {t?.contactBtn || "Contact Us"}
            </motion.a>

            {/* ✅ Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white text-sm"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white text-sm"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white text-sm"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* ✅ Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} CineReview.{" "}
            {t?.rights || "All rights reserved."}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10">
              {lang === "ar" ? "العربية" : "English"}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10">
              {t?.fast || "Fast & Responsive"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      className="text-gray-400 hover:text-white transition hover:underline underline-offset-4"
    >
      {label}
    </Link>
  );
}
