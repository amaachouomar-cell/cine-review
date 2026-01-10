import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB = "https://image.tmdb.org/t/p/w342";

// ✅ Poster paths (مضمونة + fallback)
const POSTERS = [
  "/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg", // Inception
  "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", // Fight Club
  "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // Dark Knight
  "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg", // Interstellar
  "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg", // Joker
  "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // Godfather
  "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Parasite
  "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", // Avengers
  "/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg", // Matrix
  "/hziiv14OpD73u9gAak4XDDfBKa2.jpg", // Shawshank
];

// ✅ Placeholder guaranteed (local)
const PLACEHOLDER =
  "https://via.placeholder.com/342x513/111827/ffffff?text=CineReview";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ✅ preload images before gameplay
async function preloadImages(paths) {
  const promises = paths.map(
    (p) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = TMDB + p;
        img.onload = resolve;
        img.onerror = resolve;
      })
  );
  await Promise.all(promises);
}

export default function CineMatch() {
  const { lang } = useLang();

  const levels = useMemo(
    () => [
      { pairs: 4, time: 45 },
      { pairs: 6, time: 60 },
      { pairs: 8, time: 75 },
    ],
    []
  );

  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(levels[level].time);
  const [state, setState] = useState("loading"); // loading | playing | win | lose

  // ✅ Build board
  async function buildBoard(lvl) {
    setState("loading");

    const { pairs, time } = levels[lvl];
    const selected = POSTERS.slice(0, pairs);

    // ✅ preload posters for the level to avoid black cards
    await preloadImages(selected);

    const board = shuffle([...selected, ...selected]).map((img, index) => ({
      key: index + "-" + img,
      img,
      loaded: false,
    }));

    setCards(board);
    setFlipped([]);
    setMatched(new Set());
    setBusy(false);
    setTimeLeft(time);
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
      return;
    }

    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state]);

  // ✅ Win check
  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length && state === "playing") {
      setState("win");
      confetti({
        particleCount: 160,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [matched, cards, state]);

  // ✅ Flip card
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
        }
        setFlipped([]);
        setBusy(false);
      }, 700);
    }
  }

  function restart() {
    buildBoard(level);
  }

  function nextLevel() {
    if (level < levels.length - 1) setLevel((p) => p + 1);
    else restart();
  }

  return (
    <div className="min-h-screen text-white px-4 pb-24">
      <div className="max-w-5xl mx-auto pt-10">

        {/* ✅ Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            🎴 CineMatch — {lang === "ar" ? "لعبة الذاكرة" : "Memory Game"}
          </h1>

          {state === "playing" && (
            <div className="px-5 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 font-bold flex items-center gap-2">
              ⏳ <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* ✅ Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={restart}
            className="px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold shadow"
          >
            🔁 {lang === "ar" ? "إعادة نفس المستوى" : "Restart Level"}
          </button>

          <button
            onClick={() => setLevel(0)}
            className="px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold shadow"
          >
            🏁 {lang === "ar" ? "العودة للمستوى 1" : "Back to Level 1"}
          </button>
        </div>

        {/* ✅ Game container */}
        <div className="rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-2xl backdrop-blur-xl p-5 md:p-8 overflow-hidden relative">

          {/* ✅ Glow effect */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-500/20 blur-[90px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 blur-[110px]" />

          <AnimatePresence mode="wait">

            {/* ✅ LOADING */}
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex flex-col items-center justify-center text-gray-300 font-semibold"
              >
                <div className="animate-pulse text-xl mb-3">
                  ⏳ {lang === "ar" ? "جاري تجهيز البطاقات..." : "Preparing cards..."}
                </div>
                <div className="w-56 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="w-1/2 h-full bg-red-500/60 animate-[pulse_1s_infinite]" />
                </div>
              </motion.div>
            )}

            {/* ✅ PLAYING */}
            {state === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="grid gap-3 md:gap-4"
                  style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                >
                  {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || matched.has(i);

                    return (
                      <button
                        key={card.key}
                        onClick={() => flipCard(i)}
                        className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-white/10 bg-black/40 shadow-md active:scale-[0.98] transition"
                      >
                        {/* ✅ BACK */}
                        {!isFlipped && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900">
                            <motion.div
                              animate={{ rotate: [0, 3, -3, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-3xl"
                            >
                              🎬
                            </motion.div>
                          </div>
                        )}

                        {/* ✅ FRONT */}
                        {isFlipped && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0"
                          >
                            <img
                              src={TMDB + card.img}
                              alt="poster"
                              className="w-full h-full object-cover"
                              loading="eager"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER;
                              }}
                            />
                          </motion.div>
                        )}

                        {/* ✅ Matched glow */}
                        {matched.has(i) && (
                          <div className="absolute inset-0 ring-4 ring-green-500/50 rounded-2xl pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ✅ WIN */}
            {state === "win" && (
              <motion.div
                key="win"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-3xl font-extrabold text-green-400">
                  🎉 {lang === "ar" ? "أحسنت! ربحت المستوى" : "You Won!"}
                </h2>
                <p className="text-gray-300 mt-3">
                  {lang === "ar"
                    ? "المستوى التالي أصعب... هل أنت مستعد؟"
                    : "Next level is harder — ready?"}
                </p>

                <button
                  onClick={nextLevel}
                  className="mt-6 px-7 py-3 rounded-2xl bg-green-600 hover:bg-green-700 transition font-extrabold shadow-lg"
                >
                  🚀 {lang === "ar" ? "المستوى التالي" : "Next Level"}
                </button>
              </motion.div>
            )}

            {/* ✅ LOSE */}
            {state === "lose" && (
              <motion.div
                key="lose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-3xl font-extrabold text-red-400">
                  ⏳ {lang === "ar" ? "انتهى الوقت!" : "Time’s Up!"}
                </h2>
                <p className="text-gray-300 mt-3">
                  {lang === "ar"
                    ? "حاول مرة أخرى وستفوز!"
                    : "Try again — you got this!"}
                </p>

                <button
                  onClick={restart}
                  className="mt-6 px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-lg"
                >
                  🔁 {lang === "ar" ? "إعادة المحاولة" : "Retry"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Level indicator */}
        <div className="mt-6 text-gray-300 font-semibold text-right">
          {lang === "ar" ? "المستوى:" : "Level:"}{" "}
          <span className="text-white font-extrabold">{level + 1}</span> /{" "}
          {levels.length}
        </div>
      </div>
    </div>
  );
}
