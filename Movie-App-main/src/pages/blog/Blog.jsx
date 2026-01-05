import { Link } from "react-router-dom";
import articles from "../../data/articles";
import { motion } from "framer-motion";

export default function Blog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-5xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Blog <span className="text-red-500">Articles</span>
        </h1>

        <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
          مقالات حقيقية مكتوبة لمساعدتك في اكتشاف أفلام رائعة وفهم عالم السينما.

        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 hover:border-red-500/50 transition backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold">{a.title}</h2>
              <p className="text-gray-400 mt-2 text-sm">{a.description}</p>
              <p className="text-gray-500 mt-4 text-xs">📅 {a.date}</p>
              <p className="text-red-400 mt-3 text-sm font-semibold">
                اقرأ المزيد →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
