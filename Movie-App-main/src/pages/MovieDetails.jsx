import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getSimilarMovies,
} from "../api/tmdb";
import { motion } from "framer-motion";
import { Spinner } from "../components/Spinner";

/* ✅ Star Rating Component */
function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${
            star <= value ? "text-yellow-400" : "text-white/20"
          } hover:scale-110`}
          aria-label={`rate ${star}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ✅ Review Item */
function ReviewItem({ r }) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-gray-200">
            {r.name || "Anonymous"}
          </span>
          <span className="text-yellow-400 font-semibold text-sm">
            {"★".repeat(r.rating)}
            <span className="text-white/20">{"★".repeat(5 - r.rating)}</span>
          </span>
        </div>
        <span className="text-xs text-gray-400">{r.date}</span>
      </div>

      <p className="text-gray-200 mt-3 leading-relaxed text-sm">{r.comment}</p>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ✅ Reviews State */
  const storageKey = useMemo(() => `reviews_movie_${id}`, [id]);
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setReviews(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  }, [reviews, storageKey]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [details, videos, credits, similar] = await Promise.all([
          getMovieDetails(id),
          getMovieVideos(id),
          getMovieCredits(id),
          getSimilarMovies(id),
        ]);

        setMovie(details);

        const trailer =
          videos?.results?.find((vid) => vid.type === "Trailer") ||
          videos?.results?.find((vid) => vid.type === "Teaser");

        if (trailer) setTrailerKey(trailer.key);

        setCast(credits?.cast?.slice(0, 10) || []);
        setSimilarMovies(similar?.results?.slice(0, 6) || []);
      } catch (e) {
        console.error("Movie details error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const addReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview = {
      id: crypto.randomUUID(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-GB"),
    };

    setReviews([newReview, ...reviews]);
    setName("");
    setRating(4);
    setComment("");
  };

  if (loading || !movie) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen pt-[160px] bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      {/* ✅ TOP SAFE BAR */}
      <div className="fixed top-0 left-0 right-0 h-[70px] z-[999] bg-black/70 backdrop-blur-xl border-b border-white/10 flex items-center px-5">
        <Link
          to="/"
          className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 hover:bg-black/70 transition text-sm font-semibold"
        >
          ⟵ Back
        </Link>
      </div>

      {/* ✅ HERO */}
      <div className="relative">
        {backdrop && (
          <img
            src={backdrop}
            alt={movie.title}
            className="w-full h-[420px] object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-6xl mx-auto px-4 pb-10">
            <div className="flex flex-col md:flex-row gap-6">
              {/* ✅ Poster */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full md:w-[280px] shrink-0"
              >
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                  {poster ? (
                    <img
                      src={poster}
                      alt={movie.title}
                      className="w-full h-[420px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[420px] bg-zinc-900 flex items-center justify-center text-gray-400">
                      No Poster
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ✅ Info */}
              <div className="flex-1 pt-2">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  {movie.title}
                </h1>

                <p className="text-gray-300 mt-3 leading-relaxed max-w-3xl">
                  {movie.overview || "No description available."}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-sm text-gray-200">
                    ⭐ {movie.vote_average?.toFixed(1)} / 10
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-sm text-gray-200">
                    {year}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-sm text-gray-200">
                    ⏱ {movie.runtime || "—"} min
                  </span>
                </div>

                {trailerKey && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerKey}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-6 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
                  >
                    ▶ Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* ✅ Cast */}
        {cast.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-5">🎭 Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {cast.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition"
                >
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : "https://via.placeholder.com/185x278?text=No+Image"
                    }
                    alt={actor.name}
                    className="w-full h-[240px] object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{actor.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Reviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-2xl font-bold">📝 Reviews</h3>
            <span className="text-sm text-gray-400">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>

          <form
            onSubmit={addReview}
            className="bg-zinc-900/50 border border-white/10 rounded-3xl p-5 backdrop-blur-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
              />

              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-sm text-gray-300">Your rating:</span>
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
            >
              Submit Review
            </button>
          </form>

          {reviews.length === 0 ? (
            <p className="text-gray-400">
              No reviews yet — be the first to write one ✨
            </p>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <ReviewItem key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
