import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

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

function ReviewCard({ review, onDelete, t }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-3"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-bold text-lg">{review.title}</h3>
          <p className="text-gray-400 text-xs mt-1">{review.date}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm font-semibold">
            {"★".repeat(review.rating)}
            <span className="text-white/20">
              {"★".repeat(5 - review.rating)}
            </span>
          </span>

          <button
            onClick={() => onDelete(review.id)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold"
          >
            {t?.delete || "Delete"}
          </button>
        </div>
      </div>

      <p className="text-gray-200 text-sm leading-relaxed">{review.content}</p>
    </motion.div>
  );
}

export default function Reviews() {
  const { t } = useLang();

  const storageKey = useMemo(() => `site_reviews`, []);
  const [reviews, setReviews] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setReviews(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  }, [reviews, storageKey]);

  const addReview = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newReview = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      rating,
      date: new Date().toLocaleDateString("en-GB"),
    };

    setReviews([newReview, ...reviews]);
    setTitle("");
    setContent("");
    setRating(5);
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-4 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12 space-y-8">
        {/* ✅ Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            ⭐ {t?.reviews || "Reviews"}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {t?.reviewsDesc ||
              "Write your own reviews — this helps your site get approved by AdSense."}
          </p>
        </div>

        {/* ✅ Form */}
        <form
          onSubmit={addReview}
          className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t?.reviewTitle || "Review title..."}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t?.reviewContent || "Write your review here..."}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {t?.yourRating || "Your rating:"}
              </span>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
            >
              {t?.publish || "Publish"}
            </button>
          </div>
        </form>

        {/* ✅ Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center">
            {t?.noReviews || "No reviews yet — start writing now ✨"}
          </p>
        ) : (
          <motion.div layout className="grid gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} onDelete={deleteReview} t={t} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
