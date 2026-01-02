import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          About <span className="text-red-500">CineReview</span>
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">
          CineReview is a modern platform designed to help movie lovers discover trending films,
          explore top-rated titles, and share honest reviews. We focus on speed, clean design,
          and an easy user experience.
        </p>

        <div className="mt-10 space-y-5">
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-2">✅ Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To offer a simple, fast, and high-quality movie discovery experience with real user reviews.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-2">🎬 What We Offer</h2>
            <ul className="text-gray-300 space-y-2 list-disc list-inside">
              <li>Trending movies updated weekly</li>
              <li>Top-rated films with details</li>
              <li>Favorites list</li>
              <li>User reviews to build community trust</li>
            </ul>
          </div>

          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-2">📌 Data Source</h2>
            <p className="text-gray-300 leading-relaxed">
              This website uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
