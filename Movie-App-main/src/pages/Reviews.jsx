import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function Reviews() {
  const { t } = useLang();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);

  // ✅ Fetch reviews realtime
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(data);
    });

    return () => unsub();
  }, []);

  // ✅ Add review
  const handleAddReview = async () => {
    if (!title.trim() || !content.trim()) return;

    await addDoc(collection(db, "reviews"), {
      title,
      content,
      rating,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setContent("");
    setRating(5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-3xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {t?.reviews || "Reviews"}
        </h1>

        <p className="text-gray-300 mt-4 leading-relaxed">
          {t?.reviewsDesc ||
            "Write your own reviews — this helps your site get approved by AdSense."}
        </p>

        {/* ✅ Form */}
        <div className="mt-10 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t?.reviewTitle || "Review title..."}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t?.reviewContent || "Write your review here..."}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* ✅ Rating */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-300">
              {t?.yourRating || "Your rating:"}{" "}
              <span className="font-bold text-white">{rating}/10</span>
            </p>

            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-48 accent-red-500"
            />
          </div>

          <button
            onClick={handleAddReview}
            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
          >
            {t?.publish || "Publish"}
          </button>
        </div>

        {/* ✅ Reviews list */}
        <div className="mt-12 space-y-5">
          {reviews.length === 0 ? (
            <p className="text-gray-400">{t?.noReviews || "No reviews yet."}</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h2 className="text-xl font-bold">{r.title}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  ⭐ {r.rating}/10
                </p>
                <p className="text-gray-300 mt-4 leading-relaxed">{r.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
