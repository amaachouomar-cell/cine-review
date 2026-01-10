import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

const LEVELS = [
  { id: "easy", ar: "سهل", en: "Easy", pairs: 6, time: 70 },
  { id: "medium", ar: "متوسط", en: "Medium", pairs: 8, time: 85 },
  { id: "hard", ar: "صعب", en: "Hard", pairs: 10, time: 95 },
  { id: "expert", ar: "خبير", en: "Expert", pairs: 12, time: 115 },
];

export default function CineMatch() {
  const { lang } = useLang();
  const isAR = lang === "ar";

  const [stage, setStage] = useState("select"); // select | play | win | lose
  const [level, setLevel] = useState(null);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indices
  const [matched, setMatched] = useState(new Set());

  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [loading, setLoading] = useState(false);

  // ✅ Timer
  useEffect(() => {
    if (stage !== "play") return;
    if (timeLeft <= 0) {
      setStage("lose");
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [stage, timeLeft]);

  // ✅ Load movies from TMDB and create cards
  async function startGame(selectedLevel) {
    setLevel(selectedLevel);
    setStage("play");
    setMoves(0);
    setScore(0);
    setMatched(new Set());
    setFlipped([]);
    setTimeLeft(selectedLevel.time);

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`
      );
      const data = await res.json();

      const posters = data.results
        .filter((m) => m.poster_path)
        .slice(0, selectedLevel.pairs);

      // ✅ Create duplicated pairs
      const deck = [...posters, ...posters]
        .map((m, idx) => ({
          id: `${m.id}-${idx}`,
          movieId: m.id,
          title: m.title,
          poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        }))
        .sort(() => Math.random() - 0.5);

      setCards(deck);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // ✅ Flip logic
  function flipCard(index) {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.has(index)) return;

    setFlipped((prev) => [...prev, index]);
  }

  // ✅ Compare two flipped cards
  useEffect(() => {
    if (flipped.length !== 2) return;

    const [a, b] = flipped;
    setMoves((p) => p + 1);

    if (cards[a]?.movieId === cards[b]?.movieId) {
      // ✅ Matched
      setTimeout(() => {
        setMatched((prev) => new Set([...prev, a, b]));
        setFlipped([]);
        setScore((s) => s + 120);
      }, 400);
    } else {
      // ❌ Not matched
      setTimeout(() => setFlipped([]), 850);
    }
  }, [flipped]);

  // ✅ Win Check
  useEffect(() => {
    if (stage !== "play") return;
    if (matched.size > 0 && matched.size === cards.length) {
      setStage("win");
    }
  }, [matched, cards, stage]);

  const ui = useMemo(() => {
    return {
      title: isAR ? "🎴 Cine Match" : "🎴 Cine Match",
      desc: isAR
        ? "لعبة مطابقة بوسترات الأفلام — افتح بطاقتين واطابق نفس الفيلم!"
        : "Movie Poster Matching Game — flip 2 cards and match the same movie!",
      choose: isAR ? "اختر مستوى" : "Choose Level",
      start: isAR ? "ابدأ" : "Start",
      moves: isAR ? "الحركات" : "Moves",
      score: isAR ? "النقاط" : "Score",
      time: isAR ? "الوقت" : "Time",
      playAgain: isAR ? "العب من جديد" : "Play Again",
      back: isAR ? "رجوع" : "Back",
      win: isAR ? "🎉 ممتاز! فزت!" : "🎉 Amazing! You Win!",
      lose: isAR ? "😢 انتهى الوقت!" : "😢 Time’s up!",
    };
  }, [isAR]);

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-6xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {ui.title} <span className="text-red-500">Premium</span>
        </h1>
        <p className="text-gray-300 mt-3">{ui.desc}</p>

        {/* ✅ SELECT LEVEL */}
        {stage === "select" && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">{ui.choose}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LEVELS.map((l) => (
                <motion.button
                  key={l.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(l)}
                  className="rounded-3xl bg-zinc-900/40 border border-white/10 px-6 py-6 text-left hover:bg-zinc-900/70 transition shadow-lg backdrop-blur-xl"
                >
                  <p className="text-xl font-extrabold">
                    {isAR ? l.ar : l.en}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {isAR ? "عدد الأزواج:" : "Pairs:"}{" "}
                    <span className="text-white font-bold">{l.pairs}</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {isAR ? "الوقت:" : "Time:"}{" "}
                    <span className="text-white font-bold">{l.time}s</span>
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ✅ GAME */}
        {stage === "play" && (
          <div className="mt-10">
            {/* Top Stats */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <Stat label={ui.score} value={score} />
              <Stat label={ui.moves} value={moves} />
              <Stat label={ui.time} value={`${timeLeft}s`} highlight />
              <button
                onClick={() => setStage("select")}
                className="px-5 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition text-sm font-semibold"
              >
                {ui.back}
              </button>
            </div>

            {loading ? (
              <div className="p-10 rounded-3xl bg-zinc-900/40 border border-white/10 text-center text-gray-300">
                {isAR ? "تحميل البطاقات..." : "Loading cards..."}
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  level?.pairs <= 6
                    ? "grid-cols-3 sm:grid-cols-4"
                    : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
                }`}
              >
                {cards.map((card, idx) => {
                  const isOpen = flipped.includes(idx) || matched.has(idx);
                  return (
                    <Card
                      key={card.id}
                      card={card}
                      open={isOpen}
                      onClick={() => flipCard(idx)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ✅ WIN / LOSE */}
        <AnimatePresence>
          {(stage === "win" || stage === "lose") && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              transition={{ duration: 0.35 }}
              className="mt-12 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-8 text-center shadow-2xl"
            >
              <h2 className="text-3xl font-extrabold">
                {stage === "win" ? ui.win : ui.lose}
              </h2>
              <p className="text-gray-300 mt-3">
                {ui.score}: <span className="text-white font-bold">{score}</span>{" "}
                | {ui.moves}:{" "}
                <span className="text-white font-bold">{moves}</span>
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => startGame(level)}
                  className="px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-lg"
                >
                  {ui.playAgain}
                </button>
                <button
                  onClick={() => setStage("select")}
                  className="px-7 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold"
                >
                  {ui.back}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg ${
        highlight ? "bg-red-600/20" : "bg-zinc-900/40"
      }`}
    >
      <p className="text-xs text-gray-300">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}

function Card({ card, open, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/40 shadow-xl relative"
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.img
            key="img"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            src={card.poster}
            alt={card.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900"
          >
            <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500/30 shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
