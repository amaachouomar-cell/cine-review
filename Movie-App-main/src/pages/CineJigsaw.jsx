import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

/**
 * 🎬 CineJigsaw — Movie Poster Puzzle
 * ✅ Drag & Drop + Touch
 * ✅ Levels: 3x3 .. 6x6
 * ✅ Timer + Moves + Completion
 * ✅ Smooth animations & UI
 */

const posters = [
  {
    id: "inception",
    titleEn: "Inception",
    titleAr: "إنسبشن",
    image:
      "https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  },
  {
    id: "interstellar",
    titleEn: "Interstellar",
    titleAr: "بين النجوم",
    image:
      "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: "joker",
    titleEn: "Joker",
    titleAr: "الجوكر",
    image:
      "https://image.tmdb.org/t/p/w780/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",
  },
  {
    id: "avatar",
    titleEn: "Avatar",
    titleAr: "أفاتار",
    image:
      "https://image.tmdb.org/t/p/w780/8I37NtDffNV7AZlDa7uDvvqhovU.jpg",
  },
];

export default function CineJigsaw() {
  const { lang } = useLang();

  const [poster, setPoster] = useState(posters[0]);
  const [size, setSize] = useState(3); // 3..6
  const [tiles, setTiles] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const timerRef = useRef(null);

  // ✅ computed
  const totalTiles = size * size;

  // ✅ create tiles
  const createTiles = () => {
    const arr = [];
    for (let i = 0; i < totalTiles; i++) {
      arr.push(i);
    }
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // ✅ start new game
  const startGame = () => {
    setMoves(0);
    setSeconds(0);
    setCompleted(false);
    setPlaying(true);
    setTiles(createTiles());
  };

  // ✅ stop timer when done
  useEffect(() => {
    if (!playing || completed) return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, completed]);

  // ✅ check completion
  useEffect(() => {
    if (!tiles.length) return;
    const ok = tiles.every((v, i) => v === i);
    if (ok) {
      setCompleted(true);
      setPlaying(false);
      clearInterval(timerRef.current);
    }
  }, [tiles]);

  // ✅ helpers
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ✅ swap tiles
  const swapTiles = (i, j) => {
    if (i === j) return;
    setTiles((prev) => {
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setMoves((m) => m + 1);
  };

  // ✅ drag handlers
  const onDragStart = (index) => setDragIndex(index);

  const onDrop = (index) => {
    if (dragIndex === null) return;
    swapTiles(dragIndex, index);
    setDragIndex(null);
  };

  // ✅ touch support
  const [touchPick, setTouchPick] = useState(null);

  const onTileTouch = (index) => {
    if (touchPick === null) {
      setTouchPick(index);
    } else {
      swapTiles(touchPick, index);
      setTouchPick(null);
    }
  };

  // ✅ Level label
  const levelLabel = useMemo(() => {
    if (size === 3) return lang === "ar" ? "سهل" : "Easy";
    if (size === 4) return lang === "ar" ? "متوسط" : "Medium";
    if (size === 5) return lang === "ar" ? "صعب" : "Hard";
    return lang === "ar" ? "أسطوري" : "Legendary";
  }, [size, lang]);

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-6xl mx-auto pt-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          🧩 CineJigsaw
        </motion.h1>

        <p className="text-gray-400 mt-3 max-w-3xl">
          {lang === "ar"
            ? "اجمع قطع البازل لتكوين بوستر الفيلم. كل مستوى أصعب من الذي قبله!"
            : "Assemble the puzzle pieces to complete the movie poster. Each level gets harder!"}
        </p>

        {/* ✅ Controls */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Poster select */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <h2 className="font-bold text-lg">
              {lang === "ar" ? "🎬 اختر الفيلم" : "🎬 Choose a Movie"}
            </h2>

            <div className="mt-4 flex flex-col gap-2">
              {posters.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPoster(p);
                    setPlaying(false);
                    setCompleted(false);
                    clearInterval(timerRef.current);
                  }}
                  className={`px-4 py-3 rounded-2xl border transition text-left ${
                    poster.id === p.id
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-zinc-900/40 border-white/10 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold">
                    {lang === "ar" ? p.titleAr : p.titleEn}
                  </div>
                  <div className="text-xs opacity-80">
                    {lang === "ar"
                      ? "اضغط للعب بهذا الفيلم"
                      : "Click to play this poster"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <h2 className="font-bold text-lg">
              {lang === "ar" ? "⚙️ مستوى الصعوبة" : "⚙️ Difficulty"}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {[3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setPlaying(false);
                    setCompleted(false);
                    clearInterval(timerRef.current);
                  }}
                  className={`px-4 py-2 rounded-2xl border transition font-semibold ${
                    size === s
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-zinc-900/40 border-white/10 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-400">
              {lang === "ar" ? "الصعوبة:" : "Difficulty:"}{" "}
              <span className="text-white font-semibold">{levelLabel}</span>
            </div>

            <button
              onClick={startGame}
              className="mt-6 w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
            >
              {lang === "ar" ? "ابدأ اللعبة" : "Start Puzzle"}
            </button>

            <div className="mt-4 text-sm text-gray-400 space-y-1">
              <p>
                {lang === "ar"
                  ? "📱 في الهاتف: اضغط قطعة ثم قطعة أخرى للتبديل."
                  : "📱 On mobile: tap a tile then tap another to swap."}
              </p>
              <p>
                {lang === "ar"
                  ? "💻 في الحاسوب: اسحب القطعة وأسقطها فوق قطعة أخرى."
                  : "💻 On desktop: drag & drop tiles to swap."}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <h2 className="font-bold text-lg">
              {lang === "ar" ? "📊 الإحصائيات" : "📊 Stats"}
            </h2>

            <div className="mt-4 space-y-3">
              <Stat
                label={lang === "ar" ? "الوقت" : "Time"}
                value={formatTime(seconds)}
              />
              <Stat
                label={lang === "ar" ? "الحركات" : "Moves"}
                value={moves}
              />
              <Stat
                label={lang === "ar" ? "المستوى" : "Level"}
                value={`${size}x${size}`}
              />
            </div>

            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-4"
                >
                  <h3 className="text-xl font-bold">
                    {lang === "ar" ? "🎉 أحسنت!" : "🎉 Great Job!"}
                  </h3>
                  <p className="text-gray-300 mt-2 text-sm">
                    {lang === "ar"
                      ? "لقد أكملت البازل! جرّب مستوى أصعب."
                      : "You completed the puzzle! Try a harder level."}
                  </p>

                  <button
                    onClick={() => setSize((prev) => Math.min(6, prev + 1))}
                    className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
                  >
                    {lang === "ar" ? "المستوى التالي" : "Next Level"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ✅ Puzzle Board */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Puzzle */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <h2 className="font-bold text-lg">
              {lang === "ar" ? "🧩 البازل" : "🧩 Puzzle Board"}
            </h2>

            <div
              className="mt-5 grid gap-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((tile, index) => (
                <Tile
                  key={index}
                  index={index}
                  tile={tile}
                  size={size}
                  poster={poster}
                  dragIndex={dragIndex}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  onTouch={() => onTileTouch(index)}
                  touchPicked={touchPick}
                />
              ))}
            </div>

            {!playing && !completed && (
              <p className="text-gray-400 text-sm mt-4">
                {lang === "ar"
                  ? "اضغط على زر (ابدأ اللعبة) لخلط القطع."
                  : "Press (Start Puzzle) to shuffle the tiles."}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <h2 className="font-bold text-lg">
              {lang === "ar" ? "👁️ معاينة الصورة" : "👁️ Poster Preview"}
            </h2>

            <div className="mt-5 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={poster.image}
                alt="poster"
                className="w-full object-cover"
              />
            </div>

            <p className="text-gray-400 text-sm mt-4">
              {lang === "ar"
                ? "حاول إكمال البازل بدون النظر كثيرًا!"
                : "Try to solve it without looking too much!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ Tile Component */
function Tile({
  tile,
  index,
  size,
  poster,
  onDragStart,
  onDrop,
  onTouch,
  dragIndex,
  touchPicked,
}) {
  const correct = tile === index;

  const bgSize = `${size * 100}% ${size * 100}%`;
  const row = Math.floor(tile / size);
  const col = tile % size;
  const bgPos = `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`;

  const highlight =
    touchPicked === index
      ? "ring-2 ring-red-500 scale-[1.03]"
      : correct
      ? "ring-1 ring-emerald-500/60"
      : "ring-0";

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`relative aspect-square cursor-pointer select-none ${highlight}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      onClick={onTouch}
      style={{
        backgroundImage: `url(${poster.image})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPos,
      }}
    >
      {/* glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />

      {/* mini number for debugging (optional) */}
      {/* <span className="absolute bottom-1 right-1 text-[10px] text-white/50">{index}</span> */}
    </motion.div>
  );
}

/* ✅ Stats Component */
function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-2xl px-4 py-3">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
