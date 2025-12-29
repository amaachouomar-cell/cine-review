import { useEffect, useState } from "react";
import { getTopRatedMovies } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import { motion } from "framer-motion";

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
      <div className="h-72 bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function TopRated() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRated() {
      setLoading(true);
      try {
        const data = await getTopRatedMovies(page);
        setMovies(data.results);
      } catch (e) {
        console.error("TopRated error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTopRated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-4 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          ⭐ Top Rated Movies
        </h1>
        <p className="text-gray-400 mt-2">
          أفضل الأفلام تقييماً حسب TMDB.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* ✅ Pagination */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              page === 1
                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Prev
          </button>

          <span className="text-gray-300 text-sm">
            Page <b className="text-white">{page}</b>
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl font-semibold transition bg-red-600 hover:bg-red-700 text-white"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}
