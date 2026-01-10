import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w300";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function CineMatch() {
  const { lang } = useLang();

  // ✅ Posters list (static so no API issues)
  const posters = useMemo(() => [
    "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg", // Inception
    "/9O1Iy9od7I4x7zVgF8RjzjF7QzI.jpg", // Joker
    "/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg", // Interstellar
    "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", // Fight Club
    "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", // The Dark Knight
    "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // Godfather
    "/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg", // Parasite
    "/r7XifzvtezNt31ypvsmb6Oqxw49.jpg", // Avengers
  ], []);

  // ✅ Levels
  const levels = useMemo(() => [
    { pairs: 4, time: 45 },
    { pairs: 6, time: 60 },
    { pairs: 8, time: 75 },
  ], []);

  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(levels[level].time);
  const [gameState, setGameState] = useState("loading"); 
  // loading | playing | win | lose

  // ✅ create board
  function buildBoard(lvl) {
    const { pairs } = levels[lvl];
    const selected = posters.slice(0, pairs);
    const duplicated = shuffle([...selected, ...selected]).map((img, idx) => ({
      id: idx + "-" + img,
      img,
    }));
    setCards(duplicated);
    setFlipped([]);
    setMatched(new Set());
    setBusy(false);
    setTimeLeft(levels[lvl].time);
    setGameState("playing");
  }

  // ✅ start game
  useEffect(() => {
    setGameState("loading");
    const t = setTimeout(() => buildBoard(level), 300);
    return () => clearTimeout(t);
  }, [level]);

  // ✅ timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("lose");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // ✅ check win
  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length && gameState === "playing") {
      setGameState("win");
    }
  }, [matched, cards, gameState]);

  // ✅ handle flip
  function flipCard(index) {
    if (busy) return;
    if (flipped.includes(index)) return;
    if (matched.has(index)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      const [a, b] = newFlipped;
      const first = cards[a];
      const second = cards[b];

      setTimeout(() => {
        if (first.img === second.img) {
          setMatched((prev) => {
            const copy = new Set([...prev]);
            copy.add(a);
            copy.add(b);
            return copy;
          });
        }
        setFlipped([]);
        setBusy(false);
      }, 650);
    }
  }

  // ✅ restart same level
  function restart() {
    buildBoard(level);
  }

  // ✅ next level
  function nextLevel() {
    if (level < levels.length - 1) setLevel((l) => l + 1);
    else restart();
  }

  return (
    <div className="min-h-screen text-white px-4 pb-24">
      <div className="max-w-5xl mx-auto pt-10">

        {/* ✅ Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            🎴 {lang === "ar" ? "CineMatch — لعبة الذاكرة" : "CineMatch — Memory Game"}
          </h1>

          {gameState === "playing" && (
            <div className="px-5 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 font-bold">
              ⏳ {timeLeft}s
            </div>
          )}
        </div>

        {/* ✅ Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={restart}
            className="px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold"
          >
            🔁 {lang === "ar" ? "إعادة نفس المستوى" : "Restart Level"}
          </button>

          <button
            onClick={() => setLevel(0)}
            className="px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold"
          >
            🏁 {lang === "ar" ? "العودة للمستوى 1" : "Back to Level 1"}
          </button>
        </div>

        {/* ✅ Game Board */}
        <div className="rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-2xl backdrop-blur-xl p-5 md:p-8">
          <AnimatePresence mode="wait">

            {/* ✅ LOADING */}
            {gameState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex items-center justify-center text-gray-300 text-lg font-semibold"
              >
                ⏳ {lang === "ar" ? "جاري تحميل اللعبة..." : "Loading Game..."}
              </motion.div>
            )}

            {/* ✅ PLAYING */}
            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className={`grid gap-3 md:gap-4`}
                  style={{
                    gridTemplateColumns:
                      levels[level].pairs <= 4
                        ? "repeat(4, minmax(0, 1fr))"
                        : levels[level].pairs <= 6
                        ? "repeat(4, minmax(0, 1fr))"
                        : "repeat(4, minmax(0, 1fr))",
                  }}
                >
                  {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || matched.has(i);

                    return (
                      <button
                        key={card.id}
                        onClick={() => flipCard(i)}
                        className="aspect-[3/4] rounded-2xl overflow-hidden relative group border border-white/10 bg-black/40"
                        style={{ perspective: "1000px" }}
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.45 }}
                          className="w-full h-full relative"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* BACK */}
                          <div
                            className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold bg-gradient-to-br from-zinc-900 to-black"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            🎬
                          </div>

                          {/* FRONT */}
                          <div
                            className="absolute inset-0"
                            style={{
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <img
                              src={`${TMDB_IMG}${card.img}`}
                              alt="poster"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/300x450/111/fff?text=CineReview";
                              }}
                            />
                          </div>
                        </motion.div>

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
            {gameState === "win" && (
              <motion.div
                key="win"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-3xl font-extrabold text-green-400">
                  🎉 {lang === "ar" ? "أحسنت! ربحت المستوى" : "Great! You beat the level!"}
                </h2>

                <p className="text-gray-300 mt-3">
                  {lang === "ar"
                    ? "انتقلت إلى مستوى أعلى، التحدي أكبر!"
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
            {gameState === "lose" && (
              <motion.div
                key="lose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[420px] flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-3xl font-extrabold text-red-400">
                  😅 {lang === "ar" ? "انتهى الوقت!" : "Time’s up!"}
                </h2>

                <p className="text-gray-300 mt-3">
                  {lang === "ar"
                    ? "حاول مرة أخرى وركز أكثر!"
                    : "Try again and focus — you can do it!"}
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
        <div className="mt-6 text-gray-300 font-semibold">
          {lang === "ar" ? "المستوى:" : "Level:"}{" "}
          <span className="text-white font-extrabold">{level + 1}</span> /{" "}
          {levels.length}
        </div>
      </div>
    </div>
  );
}
