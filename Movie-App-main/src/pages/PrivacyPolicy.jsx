import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function PrivacyPolicy() {
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
          {t.privacyTitle}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">{t.privacyDesc}</p>

        <div className="mt-10 space-y-5">
          <Section title={t.privacy1Title}>{t.privacy1Desc}</Section>
          <Section title={t.privacy2Title}>{t.privacy2Desc}</Section>
          <Section title={t.privacy3Title}>{t.privacy3Desc}</Section>
          <Section title={t.privacy4Title}>{t.privacy4Desc}</Section>
          <Section title={t.privacy5Title}>{t.privacy5Desc}</Section>
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
