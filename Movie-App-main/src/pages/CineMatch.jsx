import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ✅ TMDB image helper
const img = (path, size = "w342") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// ✅ Premium card back
const BACK_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Film_reel_icon.svg/512px-Film_reel_icon.svg.png";

export default function CineMatch() {
  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY; // ✅ Correct for VITE

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ levels
  const levels = useMemo(
    () => [
      { pairs: 4, time: 50 },
      { pairs: 6, time: 65 },
      { pairs: 8, time: 80 },
      { pairs: 10, time: 95 },
    ],
    []
  );

  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [timer, setTimer] = useState(level.time);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // ✅ Restart timer each level
  useEffect(() => {
    console.log("TMDB KEY:", import.meta.env.VITE_TMDB_KEY);

    setTimer(level.time);
  }, [level.time]);

  // ✅ Countdown
  useEffect(() => {
    if (gameOver || win) return;
    if (!cards.length) return;

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cards.length, gameOver, win]);

  // ✅ Fetch movies posters from TMDB
  async function loadLevel() {
    try {
      setError("");
      setLoading(true);
      setGameOver(false);
      setWin(false);
      setFlipped([]);
      setMatched([]);

      if (!TMDB_KEY) {
        setLoading(false);
        return setError(
          "❌ لم يتم العثور على TMDB API KEY. تأكد من VITE_TMDB_KEY في Vercel و env."
        );
      }

      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`
      );

      if (!res.ok) throw new Error("TMDB fetch failed");

      const data = await res.json();
      const movies = data.results
        .filter((m) => m.poster_path)
        .sort(() => 0.5 - Math.random())
        .slice(0, level.pairs);

      // ✅ create pairs
      const paired = movies.flatMap((m) => [
        { id: `${m.id}-a`, movieId: m.id, poster: img(m.poster_path), title: m.title },
        { id: `${m.id}-b`, movieId: m.id, poster: img(m.poster_path), title: m.title },
      ]);

      // ✅ shuffle
      const shuffled = paired.sort(() => 0.5 - Math.random());

      // ✅ preload posters
      await Promise.all(
        shuffled.map(
          (c) =>
            new Promise((resolve) => {
              const image = new Image();
              image.src = c.poster;
              image.onload = resolve;
              image.onerror = resolve;
            })
        )
      );

      setCards(shuffled);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError("❌ فشل تحميل البوسترات، حاول مرة أخرى.");
    }
  }

  // ✅ Initial load
  useEffect(() => {
    loadLevel();
  }, [levelIndex]);

  // ✅ Flip card logic
  function flipCard(card) {
    if (loading || gameOver || win) return;
    if (flipped.length === 2) return;
    if (matched.includes(card.movieId)) return;
    if (flipped.find((f) => f.id === card.id)) return;

    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;

      if (a.movieId === b.movieId) {
        setMatched((m) => [...m, a.movieId]);
        setTimeout(() => {
          confetti({
            particleCount: 70,
            spread: 90,
            origin: { y: 0.6 },
          });
        }, 150);

        setTimeout(() => setFlipped([]), 500);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  // ✅ Win check
  useEffect(() => {
    if (!cards.length) return;
    if (matched.length === level.pairs) {
      setWin(true);

      confetti({
        particleCount: 200,
        spread: 140,
        origin: { y: 0.5 },
      });
    }
  }, [matched, cards.length]);

  // ✅ Next Level
  function nextLevel() {
    if (levelIndex < levels.length - 1) {
      setLevelIndex((l) => l + 1);
    } else {
      setLevelIndex(0);
    }
  }

  // ✅ Restart Level
  function restartLevel() {
    loadLevel();
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto text-white">
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold tracking-wide">
          🎴 CineMatch — <span className="text-red-500">لعبة الذاكرة</span>
        </h1>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
            ⏳ {timer}s
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
            🎯 المستوى: {levelIndex + 1}
          </div>
        </div>
      </div>

      {/* ✅ Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mb-8"
        >
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={loadLevel}
            className="mt-4 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
          >
            🔁 حاول مرة أخرى
          </button>
        </motion.div>
      )}

      {/* ✅ Loading */}
      {loading && (
        <div className="text-center py-20 text-lg opacity-80">
          ⏳ جاري تحميل اللعبة...
        </div>
      )}

      {/* ✅ Game board */}
      {!loading && !error && (
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {cards.map((card) => {
            const isFlipped =
              flipped.some((f) => f.id === card.id) ||
              matched.includes(card.movieId);

            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => flipCard(card)}
                className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-xl aspect-[3/4]"
              >
                {/* ✅ Front */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 0 : 180 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img
                    src={card.poster}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </motion.div>

                {/* ✅ Back */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 flex items-center justify-center bg-zinc-950"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img
                    src={BACK_IMG}
                    alt="back"
                    className="w-14 opacity-80"
                    draggable={false}
                  />
                </motion.div>

                {/* ✅ Matched Glow */}
                {matched.includes(card.movieId) && (
                  <div className="absolute inset-0 ring-4 ring-green-400/70 shadow-[0_0_40px_rgba(34,197,94,0.6)] rounded-2xl" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ✅ Footer actions */}
      {!loading && !error && (
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={restartLevel}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold"
          >
            🔁 إعادة نفس المستوى
          </button>

          <button
            onClick={() => setLevelIndex(0)}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold"
          >
            🏁 العودة للمستوى الأول
          </button>

          {win && (
            <button
              onClick={nextLevel}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-bold"
            >
              🚀 التالي (مستوى أعلى)
            </button>
          )}

          {gameOver && (
            <button
              onClick={restartLevel}
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-bold"
            >
              💀 انتهى الوقت! حاول مجددًا
            </button>
          )}
        </div>
      )}
    </div>
  );
}
