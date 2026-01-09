import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function Terms() {
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
          {t.termsTitle}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">{t.termsDesc}</p>

        <div className="mt-10 space-y-5">
          <Section title={t.terms1Title}>{t.terms1Desc}</Section>
          <Section title={t.terms2Title}>{t.terms2Desc}</Section>
          <Section title={t.terms3Title}>{t.terms3Desc}</Section>
          <Section title={t.terms4Title}>{t.terms4Desc}</Section>
          <Section title={t.terms5Title}>{t.terms5Desc}</Section>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}
