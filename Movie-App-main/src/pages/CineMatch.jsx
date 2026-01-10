import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
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
  const [error, setError] = useState("");

  async function fetchMovies() {
    const key = import.meta.env.VITE_TMDB_KEY;

    if (!key) {
      throw new Error(
        lang === "ar"
          ? "❌ لم يتم العثور على TMDB API KEY. تأكد من VITE_TMDB_KEY داخل .env و Vercel."
          : "❌ TMDB API KEY not found. Make sure VITE_TMDB_KEY exists in .env and Vercel."
      );
    }

    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(
        lang === "ar"
          ? "❌ تعذر الاتصال بـ TMDB. تحقق من المفتاح أو الإنترنت."
          : "❌ Failed to fetch TMDB. Check API key or internet."
      );
    }

    const data = await res.json();
    return data?.results || [];
  }

  async function buildBoard(lvl) {
    try {
      setError("");
      setState("loading");

      const { pairs, time } = levels[lvl];

      const movies = await fetchMovies();

      const valid = movies.filter((m) => m.poster_path).slice(0, pairs);

      if (valid.length < pairs) {
        throw new Error(
          lang === "ar"
            ? "❌ لم يتم العثور على عدد كافي من الأفلام لبدء اللعبة."
            : "❌ Not enough valid movies found to start the game."
        );
      }

      const posterUrls = valid.map((m) => `${TMDB_IMG}${m.poster_path}`);

      const loaded = await Promise.all(posterUrls.map(preload));

      const finalPosters = loaded.map((img) => (img.ok ? img.src : FALLBACK));

      const board = shuffle([...finalPosters, ...finalPosters]).map((img, i) => ({
        id: i,
        img,
      }));

      setCards(board);
      setFlipped([]);
      setMatched(new Set());
      setBusy(false);
      setTimeLeft(time);
      setCombo(0);
      setState("playing");
    } catch (err) {
      setError(err.message);
      setState("error");
      setCards([]);
    }
  }

  useEffect(() => {
    buildBoard(level);
  }, [level]);

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

  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length && state === "playing") {
      setState("win");
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
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
      }, 600);
    }
  }

  return (
    <div className="min-h-screen text-white px-4 pb-24">
      <div className="max-w-5xl mx-auto pt-12">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            🎴 CineMatch — {lang === "ar" ? "لعبة الذاكرة" : "Memory Game"}
          </h1>

          {state === "playing" && (
            <div className="px-5 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 font-bold flex items-center gap-2 shadow-lg">
              ⏳ <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* ✅ ERROR STATE */}
        {state === "error" && (
          <div className="rounded-[2rem] bg-red-900/20 border border-red-500/20 shadow-xl p-6 text-center">
            <p className="font-bold text-red-200 text-lg">{error}</p>

            <button
              onClick={restart}
              className="mt-5 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition font-bold shadow-lg"
            >
              🔁 {lang === "ar" ? "حاول مرة أخرى" : "Try Again"}
            </button>
          </div>
        )}

        {/* ✅ LOADING */}
        {state === "loading" && (
          <div className="rounded-[2rem] bg-zinc-900/40 border border-white/10 shadow-xl p-8 text-center">
            <p className="text-lg font-bold">
              ⏳ {lang === "ar" ? "تحميل البطاقات..." : "Loading cards..."}
            </p>
          </div>
        )}

        {/* ✅ GAME BOARD */}
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
                          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-2xl"
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

                    {matched.has(i) && (
                      <div className="absolute inset-0 ring-4 ring-green-400/60 shadow-[0_0_55px_rgba(34,197,94,0.6)] rounded-2xl" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ✅ CONTROLS */}
        {state === "playing" && (
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

        {state === "win" && (
          <div className="mt-10 text-center">
            <h2 className="text-3xl font-extrabold text-green-400">
              ✅ {lang === "ar" ? "ممتاز! فزت 🎉" : "Great! You won 🎉"}
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

        {state === "lose" && (
          <div className="mt-10 text-center">
            <h2 className="text-3xl font-extrabold text-red-400">
              ❌ {lang === "ar" ? "انتهى الوقت!" : "Time’s Up!"}
            </h2>

            <button
              onClick={restart}
              className="mt-6 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition font-bold shadow-lg"
            >
              🔥 {lang === "ar" ? "حاول مرة أخرى" : "Try Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
