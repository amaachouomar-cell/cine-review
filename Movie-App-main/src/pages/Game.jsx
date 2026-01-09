import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// ✅ Difficulty config
const DIFFICULTY = {
  easy: { time: 25, choices: 3, blur: 0.6, label: { ar: "سهل", en: "Easy" } },
  medium: { time: 18, choices: 4, blur: 1.3, label: { ar: "متوسط", en: "Medium" } },
  hard: { time: 12, choices: 5, blur: 2.2, label: { ar: "صعب", en: "Hard" } },
};

// ✅ Genres
const GENRES = [
  { id: 0, label: { ar: "🔥 الرائج", en: "🔥 Trending" }, icon: "🔥" },
  { id: 28, label: { ar: "💥 أكشن", en: "💥 Action" }, icon: "💥" },
  { id: 35, label: { ar: "😂 كوميديا", en: "😂 Comedy" }, icon: "😂" },
  { id: 27, label: { ar: "😱 رعب", en: "😱 Horror" }, icon: "😱" },
  { id: 18, label: { ar: "🎭 دراما", en: "🎭 Drama" }, icon: "🎭" },
  { id: 16, label: { ar: "🧸 أنيميشن", en: "🧸 Animation" }, icon: "🧸" },
  { id: 878, label: { ar: "👽 خيال علمي", en: "👽 Sci-Fi" }, icon: "👽" },
  { id: 53, label: { ar: "🕵️ إثارة", en: "🕵️ Thriller" }, icon: "🕵️" },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const { lang } = useLang();

  // ✅ stage: "select" -> "play"
  const [stage, setStage] = useState("select");

  // ✅ selections
  const [difficulty, setDifficulty] = useState("medium");
  const [genre, setGenre] = useState(0);

  // ✅ data
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);

  // ✅ gameplay
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [xp, setXp] = useState(0); // 🎮 Level XP

  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ timer
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY[difficulty].time);
  const timerRef = useRef(null);

  // ✅ hint
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState("");

  // ✅ effects
  const [shake, setShake] = useState(false);

  const config = useMemo(() => DIFFICULTY[difficulty], [difficulty]);

  const level = useMemo(() => Math.floor(xp / 60) + 1, [xp]);
  const xpProgress = useMemo(() => xp % 60, [xp]);

  // ✅ start (fetch + play)
  async function startGame() {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRound(1);
    setXp(0);
    setStage("play");
    await fetchMovies();
  }

  async function fetchMovies() {
    try {
      setLoading(true);

      const page = Math.floor(Math.random() * 8) + 1;
      const language = lang === "ar" ? "ar" : "en-US";

      const endpoint =
        genre === 0
          ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=${language}&page=${page}`
          : `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${language}&sort_by=popularity.desc&with_genres=${genre}&page=${page}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      const clean = (data?.results || [])
        .filter((m) => m?.title && (m?.backdrop_path || m?.poster_path) && m?.vote_count > 100)
        .slice(0, 24);

      setMovies(clean);
      setTimeout(() => {
        newRound(clean);
      }, 350);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function newRound(list) {
    if (!list?.length) return;

    setLocked(false);
    setSelected(null);
    setResult(null);
    setHintUsed(false);
    setHintText("");

    const candidate = list[Math.floor(Math.random() * list.length)];
    setCurrent(candidate);

    const others = shuffle(list.filter((m) => m.id !== candidate.id)).slice(0, config.choices - 1);
    const all = shuffle([candidate, ...others]);

    setChoices(all);
    setTimeLeft(config.time);
  }

  // ✅ Timer system
  useEffect(() => {
    if (stage !== "play" || !current || locked) return;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [current, locked, stage]);

  function onTimeUp() {
    if (locked) return;
    setLocked(true);
    setResult("wrong");
    setStreak(0);
    setBestStreak((b) => Math.max(b, streak));
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function pick(movie) {
    if (locked) return;

    setSelected(movie.id);
    setLocked(true);

    const correct = movie.id === current.id;

    if (correct) {
      setResult("correct");

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
      });

      const bonus = hintUsed ? 6 : 10;
      const streakBonus = clamp(streak + 1, 1, 10);

      setScore((s) => s + bonus + streakBonus);
      setStreak((st) => st + 1);
      setBestStreak((b) => Math.max(b, streak + 1));
      setXp((x) => x + 12 + streakBonus);
    } else {
      setResult("wrong");
      setStreak(0);
      setBestStreak((b) => Math.max(b, streak));
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  function next() {
    setRound((r) => r + 1);
    if (round % 6 === 0) fetchMovies();
    else newRound(movies);
  }

  function resetToSelect() {
    setStage("select");
    setMovies([]);
    setCurrent(null);
    setChoices([]);
    setHintText("");
    setSelected(null);
    setLocked(false);
    setResult(null);
  }

  function useHint() {
    if (hintUsed || locked || !current) return;
    setHintUsed(true);

    const year = current.release_date?.slice(0, 4) || "—";
    const rating = current.vote_average ? current.vote_average.toFixed(1) : "—";

    setHintText(
      lang === "ar"
        ? `🎯 تلميح: سنة الإصدار ${year} | التقييم ${rating}/10`
        : `🎯 Hint: Release year ${year} | Rating ${rating}/10`
    );
  }

  // ✅ image handling
  const imageUrl = current?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${current.backdrop_path}`
    : current?.poster_path
    ? `https://image.tmdb.org/t/p/w780${current.poster_path}`
    : null;

  const isPosterFallback = !current?.backdrop_path && !!current?.poster_path;
  const progress = (timeLeft / config.time) * 100;

  // ✅ SELECT SCREEN (Stage 1)
  if (stage === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white px-4 pb-20">
        <div className="max-w-6xl mx-auto pt-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              🎬 {lang === "ar" ? "خمن الفيلم" : "Guess The Movie"}
            </h1>

            <p className="text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">
              {lang === "ar"
                ? "اختر فئة الأفلام وصعوبة اللعبة ثم ابدأ! هذه اللعبة تجعل الزائر يقضي وقتاً ممتعاً داخل موقعك 🎮"
                : "Choose a movie category & difficulty, then start! This game keeps visitors engaged 🎮"}
            </p>
          </motion.div>

          {/* ✅ choose genre */}
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-center">
              {lang === "ar" ? "اختر الفئة" : "Choose Category"}
            </h2>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`rounded-3xl border p-5 text-center transition relative overflow-hidden ${
                    genre === g.id
                      ? "bg-red-600 border-red-500 shadow-lg shadow-red-500/25"
                      : "bg-zinc-900/40 border-white/10 hover:bg-zinc-800"
                  }`}
                >
                  <div className="text-3xl">{g.icon}</div>
                  <div className="mt-2 font-bold">{g.label[lang]}</div>
                  {genre === g.id && (
                    <motion.div
                      layoutId="genreActive"
                      className="absolute inset-0 border-2 border-white/20 rounded-3xl"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ choose difficulty */}
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-bold text-center">
              {lang === "ar" ? "اختر الصعوبة" : "Choose Difficulty"}
            </h2>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {Object.keys(DIFFICULTY).map((k) => (
                <button
                  key={k}
                  onClick={() => setDifficulty(k)}
                  className={`px-7 py-4 rounded-3xl font-bold text-sm md:text-base border transition ${
                    difficulty === k
                      ? "bg-white text-black border-white shadow-xl"
                      : "bg-zinc-900/40 border-white/10 text-gray-200 hover:bg-zinc-800"
                  }`}
                >
                  {DIFFICULTY[k].label[lang]} • {DIFFICULTY[k].time}s
                </button>
              ))}
            </div>
          </div>

          {/* ✅ CTA Start */}
          <div className="mt-14 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="px-10 py-5 rounded-3xl bg-red-600 hover:bg-red-700 transition font-extrabold text-lg shadow-2xl shadow-red-500/25"
            >
              🚀 {lang === "ar" ? "ابدأ اللعبة الآن" : "Start The Game"}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ PLAY SCREEN (Stage 2)
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white px-4 pb-20">
      <div className="max-w-6xl mx-auto pt-10">
        {/* ✅ Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              🎬 {lang === "ar" ? "خمن الفيلم" : "Guess The Movie"}
            </h1>

            <p className="text-gray-300 mt-3 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "اختر العنوان الصحيح قبل انتهاء الوقت! كلما ربحت أكثر تحصل على مستوى أعلى."
                : "Pick the correct title before time runs out! Win streaks to level up."}
            </p>
          </div>

          {/* ✅ Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label={lang === "ar" ? "النقاط" : "Score"} value={score} />
            <Stat label={lang === "ar" ? "سلسلة" : "Streak"} value={streak} />
            <Stat label={lang === "ar" ? "الأفضل" : "Best"} value={bestStreak} />
            <Stat label={lang === "ar" ? "الجولة" : "Round"} value={round} />
            <Stat label={lang === "ar" ? `المستوى ${level}` : `Level ${level}`} value={`${xpProgress}/60`} />
          </div>
        </div>

        {/* ✅ Actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={useHint}
              disabled={hintUsed || locked}
              className={`px-4 py-3 rounded-2xl font-bold text-sm transition ${
                hintUsed || locked
                  ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/15 text-white"
              }`}
            >
              💡 {lang === "ar" ? "تلميح" : "Hint"}
            </button>

            <button
              onClick={fetchMovies}
              className="px-4 py-3 rounded-2xl font-bold text-sm transition bg-zinc-900/40 border border-white/10 hover:bg-zinc-800"
            >
              🔄 {lang === "ar" ? "تحديث الأفلام" : "Refresh Movies"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetToSelect}
              className="px-4 py-3 rounded-2xl font-bold text-sm transition bg-zinc-900/40 border border-white/10 hover:bg-zinc-800"
            >
              🎯 {lang === "ar" ? "تغيير الفئة" : "Change Category"}
            </button>
          </div>
        </div>

        {/* ✅ Hint Text */}
        <AnimatePresence>
          {hintText && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-200"
            >
              {hintText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Image + Choices */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <motion.div
            animate={shake ? { x: [0, -10, 10, -7, 7, 0] } : {}}
            transition={{ duration: 0.35 }}
            className="lg:col-span-2"
          >
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-xl">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Guess the movie"
                    className={`w-full h-[260px] md:h-[380px] object-cover ${
                      isPosterFallback ? "scale-125 blur-[2px]" : ""
                    }`}
                    style={{
                      filter: `blur(${config.blur}px)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/10"></div>

                  {/* Timer */}
                  <div className="absolute top-0 left-0 w-full">
                    <div className="h-2 bg-black/40">
                      <motion.div
                        className="h-2 bg-red-600"
                        initial={{ width: "100%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 border border-white/10 px-4 py-2 rounded-2xl">
                    <span className="text-sm font-extrabold">
                      ⏳ {timeLeft}s
                    </span>
                  </div>

                  {/* overlay message */}
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-8 py-6 rounded-3xl border shadow-2xl text-center ${
                          result === "correct"
                            ? "bg-green-600/20 border-green-500"
                            : "bg-red-600/20 border-red-500"
                        }`}
                      >
                        <h3 className="text-3xl font-extrabold">
                          {result === "correct"
                            ? lang === "ar"
                              ? "✅ صحيح!"
                              : "✅ Correct!"
                            : lang === "ar"
                            ? "❌ خطأ!"
                            : "❌ Wrong!"}
                        </h3>

                        <p className="text-gray-200 mt-2 font-semibold">
                          {lang === "ar" ? "الإجابة الصحيحة:" : "Correct answer:"}{" "}
                          <span className="text-white">{current?.title}</span>
                        </p>

                        <button
                          onClick={next}
                          className="mt-5 px-6 py-3 rounded-2xl bg-white text-black font-extrabold hover:bg-gray-200 transition"
                        >
                          {lang === "ar" ? "التالي →" : "Next →"}
                        </button>
                      </motion.div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-[260px] md:h-[380px] flex items-center justify-center text-gray-400">
                  {lang === "ar" ? "لا توجد صورة" : "No Image"}
                </div>
              )}
            </div>
          </motion.div>

          {/* Choices */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
            <h2 className="text-lg font-extrabold mb-4">
              {lang === "ar" ? "اختر العنوان الصحيح" : "Choose The Correct Title"}
            </h2>

            {loading ? (
              <p className="text-gray-400">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {choices.map((m) => {
                  const isCorrect = locked && m.id === current.id;
                  const isWrong = locked && selected === m.id && m.id !== current.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => pick(m)}
                      disabled={locked}
                      className={`px-4 py-4 rounded-2xl font-bold text-sm text-left border transition relative overflow-hidden ${
                        isCorrect
                          ? "bg-green-600/20 border-green-500 text-white"
                          : isWrong
                          ? "bg-red-600/20 border-red-500 text-white"
                          : "bg-zinc-950/50 border-white/10 text-gray-200 hover:bg-zinc-800"
                      }`}
                    >
                      <span className="relative z-10">{m.title}</span>
                      {isCorrect && <span className="absolute right-4 top-1/2 -translate-y-1/2">✅</span>}
                      {isWrong && <span className="absolute right-4 top-1/2 -translate-y-1/2">❌</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 text-xs text-gray-400 leading-relaxed">
              {lang === "ar"
                ? "✅ نصيحة: اختر مستوى صعب لتحدي أكبر وزيادة النقاط!"
                : "✅ Tip: Play Hard mode for bigger challenge & more points!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Stat component
function Stat({ label, value }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xl">
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
      <p className="text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}
