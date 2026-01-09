import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function Contact() {
  const { t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-3xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {t.contactTitle}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">{t.contactDesc}</p>

        <div className="mt-10 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-5">
          <div>
            <p className="text-gray-400 text-sm">{t.contactEmail}:</p>
            <p className="text-white font-semibold">your-email@gmail.com</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">{t.contactTime}:</p>
            <p className="text-white font-semibold">{t.contactTimeValue}</p>
          </div>

          <a
            href="mailto:your-email@gmail.com"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg text-sm"
          >
            {t.contactSend}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
