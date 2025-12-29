import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getTrendingMovies } from "../api/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function HeroSlider() {
  const { t, lang } = useLang();

  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        const data = await getTrendingMovies(1);
        const list = data?.results?.slice(0, 8) || [];
        setMovies(list);
        setIndex(0);
      } catch (e) {
        console.error("HeroSlider error:", e);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  // ✅ Auto slide
  useEffect(() => {
    if (!movies.length || paused) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(intervalRef.current);
  }, [movies, paused]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <div className="h-[340px] md:h-[420px] rounded-3xl bg-zinc-900/50 border border-white/10 animate-pulse" />
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-6 text-gray-300">
          ❌ Slider لم يتم تحميله — تأكد أن TMDB API يعمل (مفتاح API صحيح).
        </div>
      </div>
    );
  }

  const movie = movies[index];

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 shadow-[0_25px_70px_rgba(0,0,0,0.65)]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0.2, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* ✅ Background */}
            {backdrop ? (
              <img
                src={backdrop}
                alt={movie.title}
                className="w-full h-[340px] md:h-[420px] object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-[340px] md:h-[420px] bg-zinc-950 flex items-center justify-center text-gray-400">
                {t?.noBackdrop || "No Backdrop"}
              </div>
            )}

            {/* ✅ Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* ✅ Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="p-6 md:p-10 max-w-2xl">
                <p className="text-red-500 font-semibold text-sm mb-2">
                  🔥 {t?.trendingWeek || "Trending this week"}
                </p>

                <h2 className="text-2xl md:text-5xl font-extrabold leading-tight">
                  {movie.title}
                </h2>

                <p className="text-gray-200/90 mt-3 text-sm md:text-base line-clamp-3">
                  {movie.overview || t?.noDesc || "No description available."}
                </p>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <Link
                    to={`/movie/${movie.id}`}
                    className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
                  >
                    {t?.viewDetails || "View Details"}
                  </Link>

                  <span className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-gray-200">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ✅ Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {movies.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-red-500" : "w-2.5 bg-white/30"
              }`}
              aria-label={`slide ${i}`}
            />
          ))}
        </div>

        {/* ✅ Prev / Next (RTL aware) */}
        <button
          onClick={() =>
            setIndex((prev) => (prev - 1 + movies.length) % movies.length)
          }
          className={`hidden md:flex absolute ${
            lang === "ar" ? "right-4" : "left-4"
          } top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-lg items-center justify-center hover:scale-110 transition`}
        >
          {lang === "ar" ? "⟶" : "⟵"}
        </button>

        <button
          onClick={() => setIndex((prev) => (prev + 1) % movies.length)}
          className={`hidden md:flex absolute ${
            lang === "ar" ? "left-4" : "right-4"
          } top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-lg items-center justify-center hover:scale-110 transition`}
        >
          {lang === "ar" ? "⟵" : "⟶"}
        </button>
      </div>
    </div>
  );
}
