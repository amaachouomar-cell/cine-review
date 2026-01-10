import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// ✅ Difficulty levels (card pairs)
const LEVELS = [
  { level: 1, pairs: 2, time: 35 }, // 4 cards
  { level: 2, pairs: 3, time: 45 }, // 6 cards
  { level: 3, pairs: 4, time: 55 }, // 8 cards
  { level: 4, pairs: 5, time: 65 }, // 10 cards
  { level: 5, pairs: 6, time: 75 }, // 12 cards
];

export default function CineMatch() {
  const { lang } = useLang();

  const [movies, setMovies] = useState([]);
  const [levelIndex, setLevelIndex] = useState(0);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indexes
  const [matched, setMatched] = useState([]); // ids
  const [moves, setMoves] = useState(0);

  const [timeLeft, setTimeLeft] = useState(LEVELS[levelIndex].time);
  const [status, setStatus] = useState("loading"); // loading, ready, playing, win, lose
  const [powerUsed, setPowerUsed] = useState(false);

  const intervalRef = useRef(null);

  const level = LEVELS[levelIndex];

  // ✅ Fetch movies once
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setStatus("loading");
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${
            import.meta.env.VITE_TMDB_KEY
          }`
        );
        const data = await res.json();

        const list = (data.results || [])
          .filter((m) => m.poster_path)
          .slice(0, 30);

        setMovies(list);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("ready");
      }
    };

    fetchMovies();
  }, []);

  // ✅ Build deck for current level
  useEffect(() => {
    if (!movies.length) return;

    const selected = shuffle([...movies]).slice(0, level.pairs);
    const deck = shuffle(
      [...selected, ...selected].map((m, idx) => ({
        uid: `${m.id}-${idx}-${Math.random()}`,
        id: m.id,
        title: m.title,
        poster: m.poster_path,
      }))
    );

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setPowerUsed(false);
    setTimeLeft(level.time);
    setStatus("playing");
  }, [movies, levelIndex]);

  // ✅ Timer
  useEffect(() => {
    if (status !== "playing") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setStatus("lose");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [status]);

  // ✅ Win detection
  useEffect(() => {
    if (!cards.length) return;

    if (matched.length === level.pairs && status === "playing") {
      setStatus("win");
      clearInterval(intervalRef.current);

      // 🎉 confetti
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.55 },
      });
    }
  }, [matched, cards.length, status, level.pairs]);

  // ✅ click logic
  const handleFlip = (index) => {
    if (status !== "playing") return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].id)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = cards[newFlipped[0]];
      const second = cards[newFlipped[1]];

      if (first.id === second.id) {
        // ✅ match
        setMatched((prev) => [...prev, first.id]);
        setTimeout(() => setFlipped([]), 550);
      } else {
        // ❌ mismatch
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  // ✅ Power: Reveal all for 1.2s (only once)
  const usePower = () => {
    if (powerUsed || status !== "playing") return;

    setPowerUsed(true);
    const allIndexes = cards.map((_, i) => i);

    setFlipped(allIndexes);
    setTimeout(() => setFlipped([]), 1200);
  };

  // ✅ Next Level
  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex((i) => i + 1);
    } else {
      setLevelIndex(0);
    }
  };

  // ✅ Restart
  const restart = () => {
    setLevelIndex(0);
  };

  const titleText =
    lang === "ar"
      ? "🎴 CineMatch — لعبة الذاكرة السينمائية"
      : "🎴 CineMatch — Movie Memory Challenge";

  const descText =
    lang === "ar"
      ? "اقلب البطاقات واصنع الأزواج قبل انتهاء الوقت! كل مستوى أصعب من السابق."
      : "Flip cards and match pairs before time runs out. Each level gets harder!";

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-black to-black text-white">
      <div className="max-w-5xl mx-auto pt-10">
        {/* ✅ Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {titleText}
            </h1>
            <p className="text-gray-300 mt-2">{descText}</p>
          </div>

          <NavLink
            to="/games"
            className="px-4 py-2 rounded-2xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold"
          >
            {lang === "ar" ? "⬅ العودة للألعاب" : "⬅ Back to Games"}
          </NavLink>
        </motion.div>

        {/* ✅ HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <HUDCard label={lang === "ar" ? "المستوى" : "Level"} value={`#${level.level}`} />
          <HUDCard label={lang === "ar" ? "الوقت" : "Time"} value={`${timeLeft}s`} />
          <HUDCard label={lang === "ar" ? "المحاولات" : "Moves"} value={moves} />
          <HUDCard
            label={lang === "ar" ? "الأزواج" : "Pairs"}
            value={`${matched.length}/${level.pairs}`}
          />
        </div>

        {/* ✅ Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={usePower}
            disabled={powerUsed || status !== "playing"}
            className={`px-5 py-3 rounded-2xl font-bold shadow-lg transition ${
              powerUsed
                ? "bg-zinc-800 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {lang === "ar"
              ? powerUsed
                ? "✨ استخدمت المساعدة"
                : "✨ كشف سريع (مرة واحدة)"
              : powerUsed
              ? "✨ Power Used"
              : "✨ Quick Reveal (once)"}
          </button>

          <button
            onClick={() => setLevelIndex((i) => i)}
            className="px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-semibold"
          >
            {lang === "ar" ? "🔄 إعادة نفس المستوى" : "🔄 Restart Level"}
          </button>
        </div>

        {/* ✅ Board */}
        <div className="rounded-[2.5rem] border border-white/10 bg-zinc-900/30 backdrop-blur-xl shadow-2xl p-5 md:p-8">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-gray-300"
              >
                {lang === "ar" ? "⏳ جاري تحميل اللعبة..." : "⏳ Loading game..."}
              </motion.div>
            )}

            {(status === "playing" || status === "win" || status === "lose") && (
              <motion.div
                key="board"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className={`grid gap-4 ${
                    level.pairs <= 3
                      ? "grid-cols-3 md:grid-cols-4"
                      : "grid-cols-4 md:grid-cols-6"
                  }`}
                >
                  {cards.map((card, idx) => (
                    <PremiumCard
                      key={card.uid}
                      card={card}
                      flipped={flipped.includes(idx) || matched.includes(card.id)}
                      matched={matched.includes(card.id)}
                      onClick={() => handleFlip(idx)}
                    />
                  ))}
                </div>

                {/* ✅ Result Overlay */}
                <AnimatePresence>
                  {status === "win" && (
                    <ResultOverlay
                      title={lang === "ar" ? "🎉 ممتاز! فزت بالمستوى!" : "🎉 Great! Level Completed!"}
                      subtitle={
                        lang === "ar"
                          ? `المحاولات: ${moves} — الوقت المتبقي: ${timeLeft}s`
                          : `Moves: ${moves} — Time left: ${timeLeft}s`
                      }
                      primaryBtn={lang === "ar" ? "➡️ المستوى التالي" : "➡️ Next Level"}
                      onPrimary={nextLevel}
                      secondaryBtn={lang === "ar" ? "🔁 إعادة من البداية" : "🔁 Restart All"}
                      onSecondary={restart}
                    />
                  )}

                  {status === "lose" && (
                    <ResultOverlay
                      title={lang === "ar" ? "⏰ انتهى الوقت!" : "⏰ Time's up!"}
                      subtitle={
                        lang === "ar"
                          ? "لا بأس… حاول مرة أخرى وستنجح!"
                          : "No worries — try again and win!"
                      }
                      primaryBtn={lang === "ar" ? "🔁 أعد المحاولة" : "🔁 Try Again"}
                      onPrimary={() => setLevelIndex((i) => i)}
                      secondaryBtn={lang === "ar" ? "⬅ العودة للألعاب" : "⬅ Back to Games"}
                      onSecondary={() => (window.location.href = "/games")}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function HUDCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-zinc-900/40 border border-white/10 px-4 py-4 backdrop-blur-xl shadow-lg">
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
      <p className="text-lg md:text-xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

function PremiumCard({ card, flipped, matched, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative aspect-[2/3] w-full rounded-3xl focus:outline-none"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative w-full h-full rounded-3xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shadow-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_bottom,rgba(255,0,80,0.10),transparent_60%)]" />
          <span className="text-3xl">🎬</span>
          <div className="absolute bottom-3 left-3 right-3 h-8 rounded-2xl bg-white/5 border border-white/10" />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <img
            src={`${TMDB_IMG}${card.poster}`}
            alt={card.title}
            className={`w-full h-full object-cover ${
              matched ? "brightness-110" : "brightness-95"
            }`}
            loading="lazy"
          />
          {/* Premium overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl" />

          {/* Shine effect */}
          <motion.div
            initial={{ x: "-120%" }}
            animate={{ x: flipped ? "120%" : "-120%" }}
            transition={{ duration: 0.9 }}
            className="absolute top-0 left-0 h-full w-1/2 bg-white/10 blur-xl rotate-12"
          />
        </div>
      </motion.div>

      {matched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -right-2 bg-emerald-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg"
        >
          ✓ MATCH
        </motion.div>
      )}
    </motion.button>
  );
}

function ResultOverlay({ title, subtitle, primaryBtn, secondaryBtn, onPrimary, onSecondary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      className="mt-10 rounded-[2rem] bg-zinc-950/90 border border-white/10 p-7 text-center shadow-2xl backdrop-blur-xl"
    >
      <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
      <p className="text-gray-300 mt-2">{subtitle}</p>

      <div className="mt-6 flex flex-col md:flex-row gap-3 justify-center">
        <button
          onClick={onPrimary}
          className="px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-lg"
        >
          {primaryBtn}
        </button>

        <button
          onClick={onSecondary}
          className="px-7 py-3 rounded-2xl bg-zinc-900/70 border border-white/10 hover:bg-zinc-800 transition font-bold"
        >
          {secondaryBtn}
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------- Utils ---------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
