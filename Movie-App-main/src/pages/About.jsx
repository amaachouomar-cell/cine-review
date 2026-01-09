import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function About() {
  const { t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {t.aboutTitle}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">{t.aboutDesc}</p>

        <div className="mt-10 space-y-5">
          <Section title={t.aboutMissionTitle}>{t.aboutMissionDesc}</Section>

          <Section title={t.aboutOfferTitle}>
            <ul className="text-gray-300 space-y-2 list-disc list-inside">
              <li>{t.aboutOffer1}</li>
              <li>{t.aboutOffer2}</li>
              <li>{t.aboutOffer3}</li>
              <li>{t.aboutOffer4}</li>
            </ul>
          </Section>

          <Section title={t.aboutDataTitle}>{t.aboutDataDesc}</Section>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}
