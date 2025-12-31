import { useFavorites } from "../hooks/useFavorites";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { memo } from "react";
import { useLang } from "../i18n/LanguageContext";

function MovieCard({ movie }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t } = useLang();

  // ✅ Smaller image for grid = faster
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  const toggleFavorite = (e) => {
    e.preventDefault();
    isFavorite(movie.id) ? removeFavorite(movie.id) : addFavorite(movie);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-3xl overflow-hidden bg-zinc-900/60 border border-white/5 shadow-[0_15px_35px_rgba(0,0,0,0.45)]
      ${isFavorite(movie.id) ? "ring-2 ring-red-500/20" : ""}`}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative">
          {image ? (
            <img
              src={image}
              alt={movie.title}
              className="w-full h-[320px] object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          ) : (
            <div className="w-full h-[320px] bg-zinc-900 flex items-center justify-center text-gray-400">
              {t?.noPoster || "No Poster"}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition duration-300">
            <button className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm">
              {t?.viewDetails || "View Details"}
            </button>
          </div>

          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </div>

          <div className="absolute top-3 left-[92px] px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            {year}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-white font-bold text-base line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {movie.overview || t?.noDesc || "No description available."}
          </p>
        </div>
      </Link>

      <button
        onClick={toggleFavorite}
        aria-label="toggle favorite"
        className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 hover:scale-110 transition"
      >
        {isFavorite(movie.id) ? (
          <span className="text-red-500 text-xl animate-pulse">❤️</span>
        ) : (
          <span className="text-white text-xl">🤍</span>
        )}
      </button>
    </motion.div>
  );
}

export default memo(MovieCard);
