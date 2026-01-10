import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// ✅ fallback image (no local posters)
const FALLBACK =
  "https://dummyimage.com/600x900/111/ffffff.png&text=CineReview";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve({ ok: true, src });
    img.onerror = () => resolve({ ok: false, src });
  });
}

export default function CineMatch() {
  const { lang } = useLang();

  const levels = useMemo(
    () => [
      { pairs: 4, time: 45 },
      { pairs: 6, time: 65 },
      { pairs: 8, time: 85 },
    ],
    []
  );

  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(levels[level].time);
  const [state, setState] = useState("loading");
  const [combo, setCombo] = useState(0);

  // ✅ fetch posters from TMDB API (safe)
  async function fetchMovies() {
    const key = import.meta.env.VITE_TMDB_KEY;
    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.results || [];
  }

  async function buildBoard(lvl) {
    setState("loading");

    const { pairs, time } = levels[lvl];

    const movies = await fetchMovies();

    // ✅ take only movies that have posters
    const valid = movies
      .filter((m) => m.poster_path)
      .slice(0, pairs);

    const posterUrls = valid.map((m) => `${TMDB_IMG}${m.poster_path}`);

    // ✅ Preload posters fast
    const loaded = await Promise.all(posterUrls.map(preload));

    // ✅ Use fallback if any poster fails
    const finalPosters = loaded.map((img) => (img.ok ? img.src : FALLBACK));

    const board = shuffle([...finalPosters, ...finalPosters]).map((img, i) => ({
      id: i,
      img,
      loaded: true,
    }));

    setCards(board);
    setFlipped([]);
    setMatched(new Set());
    setBusy(false);
    setTimeLeft(time);
    setCombo(0);
    setState("playing");
  }

  useEffect(() => {
    buildBoard(level);
  }, [level]);

  // ✅ Timer
  useEffect(() => {
    if (state !== "playing") return;

    if (timeLeft <= 0) {
      setState("lose");
      setCombo(0);
      return;
    }

    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state]);

  // ✅ Win
  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length && state === "playing") {
      setState("win");
      confetti({ particleCount: 200, spread: 85, origin: { y: 0.65 } });
    }
  }, [matched, cards, state]);

  function restart() {
    buildBoard(level);
  }

  function nextLevel() {
    if (level < levels.length - 1) setLevel((p) => p + 1);
    else setLevel(0);
  }

  function flipCard(i) {
    if (busy || matched.has(i) || flipped.includes(i)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, i];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);

      const [a, b] = newFlipped;
      const first = cards[a].img;
      const second = cards[b].img;

      setTimeout(() => {
        if (first === second) {
          setMatched((prev) => new Set([...prev, a, b]));

          confetti({
            particleCount: 60,
            spread: 65,
            origin: { y: 0.55 },
          });

          setCombo((c) => c + 1);
        } else {
          setCombo(0);
        }

        setFlipped([]);
        setBusy(false);
      }, 650);
    }
  }

  return (
    <div className="min-h-screen text-white px-4 pb-20">
      <div className="max-w-5xl mx-auto pt-10">
        {/* ✅ Title */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            🎴 CineMatch — {lang === "ar" ? "لعبة الذاكرة" : "Memory Game"}
          </h1>

          {state === "playing" && (
            <div className="px-5 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 font-bold flex items-center gap-2 shadow-lg">
              ⏳ <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* ✅ Combo */}
        {combo >= 2 && state === "playing" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-green-400 font-bold text-lg"
          >
            ⚡ COMBO x{combo}
          </motion.div>
        )}

        {/* ✅ Loading */}
        {state === "loading" && (
          <div className="rounded-[2rem] bg-zinc-900/40 border border-white/10 shadow-xl p-10 text-center">
            <p className="text-lg font-bold">
              ⏳ {lang === "ar" ? "جاري تحميل الصور بسرعة..." : "Loading posters fast..."}
            </p>
          </div>
        )}

        {/* ✅ Board */}
        {state === "playing" && (
          <div className="rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-2xl backdrop-blur-xl p-6">
            <div
              className={`grid gap-4 ${
                levels[level].pairs <= 4 ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6"
              }`}
            >
              {cards.map((c, i) => {
                const isOpen = flipped.includes(i) || matched.has(i);

                return (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => flipCard(i)}
                    className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg"
                  >
                    <AnimatePresence mode="wait">
                      {!isOpen ? (
                        <motion.div
                          key="closed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black"
                        >
                          🎬
                        </motion.div>
                      ) : (
                        <motion.img
                          key="open"
                          src={c.img}
                          alt=""
                          initial={{ opacity: 0, scale: 1.08 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </AnimatePresence>

                    {/* ✅ Match Glow */}
                    {matched.has(i) && (
                      <div className="absolute inset-0 ring-4 ring-green-400/60 shadow-[0_0_50px_rgba(34,197,94,0.55)] rounded-2xl" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ✅ Win */}
        {state === "win" && (
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold text-green-400">
              ✅ {lang === "ar" ? "لقد فزت!" : "You Win!"}
            </h2>

            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <button
                onClick={nextLevel}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition font-bold shadow-lg"
              >
                ➡️ {lang === "ar" ? "المستوى التالي" : "Next Level"}
              </button>

              <button
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold shadow"
              >
                🔁 {lang === "ar" ? "إعادة" : "Restart"}
              </button>
            </div>
          </div>
        )}

        {/* ✅ Lose */}
        {state === "lose" && (
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold text-red-400">
              ❌ {lang === "ar" ? "انتهى الوقت!" : "Time’s Up!"}
            </h2>

            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <button
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition font-bold shadow-lg"
              >
                🔥 {lang === "ar" ? "حاول مرة أخرى" : "Try Again"}
              </button>
            </div>
          </div>
        )}

        {/* ✅ Footer Controls */}
        {state !== "loading" && (
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <button
              onClick={restart}
              className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold shadow"
            >
              🔁 {lang === "ar" ? "إعادة نفس المستوى" : "Restart Level"}
            </button>

            <button
              onClick={() => setLevel(0)}
              className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold shadow"
            >
              🏁 {lang === "ar" ? "المستوى الأول" : "Level 1"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
