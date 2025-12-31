import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-14 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold">About CineReview</h1>
        <p className="text-gray-300 leading-relaxed">
          CineReview is a movie & TV review platform built to help you discover the best films
          through ratings, reviews and recommendations. Our goal is to provide a clean and fast
          experience for cinema lovers.
        </p>

        <p className="text-gray-400 text-sm">
          This website uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </motion.div>
  );
}
