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
            star <= value ? "text-yellow-400" : "text-white/15"
          } hover:scale-110`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t, lang } = useLang();

  const storageKey = useMemo(() => "cine_reviews_blog", []);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setItems(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addPost = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: crypto.randomUUID(),
      title: title.trim(),
      rating,
      content: content.trim(),
      date: new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB"),
    };

    setItems([newPost, ...items]);
    setTitle("");
    setRating(5);
    setContent("");
  };

  const deletePost = (id) => {
    setItems(items.filter((p) => p.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-4 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-5xl mx-auto pt-10 space-y-10">
        {/* ✅ Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            📝 {t?.reviews || "Reviews"}
          </h1>
          <p className="text-gray-400">
            {t?.reviewsDesc ||
              "Write your own reviews and share your opinion — this content helps your site get approved by AdSense."}
          </p>
        </div>

        {/* ✅ Add Review */}
        <form
          onSubmit={addPost}
          className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t?.reviewTitle || "Review title..."}
              className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
            />

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-sm text-gray-300">
                {t?.yourRating || "Your rating:"}
              </span>
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t?.reviewContent || "Write your review..."}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-red-500 transition"
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
          >
            {t?.publish || "Publish"}
          </button>
        </form>

        {/* ✅ Posts */}
        {items.length === 0 ? (
          <p className="text-gray-400">
            {t?.noReviews || "No reviews yet — start writing now ✨"}
          </p>
        ) : (
          <div className="grid gap-4">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{p.title}</h2>
                    <p className="text-yellow-400 text-sm font-semibold mt-1">
                      {"★".repeat(p.rating)}
                      <span className="text-white/20">
                        {"★".repeat(5 - p.rating)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{p.date}</p>
                  </div>

                  <button
                    onClick={() => deletePost(p.id)}
                    className="text-xs px-3 py-2 rounded-xl bg-black/40 border border-white/10 hover:bg-black/70 transition"
                  >
                    {t?.delete || "Delete"}
                  </button>
                </div>

                <p className="text-gray-200 mt-4 leading-relaxed text-sm whitespace-pre-line">
                  {p.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
