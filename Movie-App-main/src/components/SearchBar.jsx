import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function SearchBar({ value, onChange, onSubmit }) {
  const { t } = useLang();

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="w-full max-w-2xl mx-auto flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <input
        type="text"
        placeholder={t.searchPlaceholder || "Search movies..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white placeholder:text-gray-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition shadow-lg"
      />

      <button
        type="submit"
        className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
      >
        {t.searchBtn || "Search"}
      </button>
    </motion.form>
  );
}
