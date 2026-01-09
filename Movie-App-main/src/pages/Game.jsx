import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/original";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// ✅ Categories (TMDB genre ids)
const GENRES = [
  { id: 28, labelEn: "Action", labelAr: "أكشن", emoji: "🔥" },
  { id: 35, labelEn: "Comedy", labelAr: "كوميديا", emoji: "😂" },
  { id: 18, labelEn: "Drama", labelAr: "دراما", emoji: "🎭" },
  { id: 27, labelEn: "Horror", labelAr: "رعب", emoji: "👻" },
  { id: 10749, labelEn: "Romance", labelAr: "رومانسي", emoji: "💖" },
  { id: 878, labelEn: "Sci-Fi", labelAr: "خيال علمي", emoji: "🛸" },
  { id: 9648, labelEn: "Mystery", labelAr: "غموض", emoji: "🕵️" },
];

export default function Quiz() {
  const { lang } = useLang();

  const [stage, setStage] = useState("choose"); // choose | intro | playing | result
  const [genre, setGenre] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);

  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(null);

  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);

  const [timer, setTimer] = useState(20);
  const timerRef = useRef(null);

  const [score, setScore] = useState(0);

  // ✅ Helps (3 times only)
  const [hintLeft, setHintLeft] = useState(3);
  const [removeLeft, setRemoveLeft] = useState(3);

  const [hintText, setHintText] = useState("");
  const [removed, setRemoved] = useState([]);

  // ✅ Loading image fast
  const [imgReady, setImgReady] = useState(false);
  const imgPreloadRef = useRef(null);

  const t = useMemo(() => {
    const ar = {
      title: "🎬 خمن الفيلم",
      sub: "اختر فئة، ثم حاول تخمين الفيلم من الصورة!",
      choose: "اختر فئة الأفلام",
      start: "ابدأ الجولة 🚀",
      next: "التالي ➜",
      hint: "تلميح",
      remove2: "حذف خيارين",
      time: "الوقت",
      score: "النقاط",
      correct: "✅ صحيح!",
      wrong: "❌ خطأ!",
      answer: "الإجابة الصحيحة:",
      playAgain: "العب من جديد",
      back: "الرجوع للفئات",
      loading: "تحميل الصورة...",
      limited: "محدودة",
      hintDesc: "سنة الإصدار + التقييم",
      removeDesc: "حذف خيارين خاطئين",
      finishTitle: "🎉 نهاية اللعبة!",
      finishDesc: "نتيجتك النهائية:",
    };

    const en = {
      title: "🎬 Guess The Movie",
      sub: "Pick a category, then guess the movie from the image!",
      choose: "Choose a movie category",
      start: "Start Round 🚀",
      next: "Next ➜",
      hint: "Hint",
      remove2: "Remove 2",
      time: "Time",
      score: "Score",
      correct: "✅ Correct!",
      wrong: "❌ Wrong!",
      answer: "Correct Answer:",
      playAgain: "Play Again",
      back: "Back to Categories",
      loading: "Loading image...",
      limited: "Limited",
      hintDesc: "Year + Rating",
      removeDesc: "Remove 2 wrong options",
      finishTitle: "🎉 Game Over!",
      finishDesc: "Your final score:",
    };

    return lang === "ar" ? ar : en;
  }, [lang]);

  // ✅ Fetch movies for selected genre (only popular + have backdrop)
  async function fetchMoviesByGenre(genreId) {
    const url =
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}` +
      `&with_genres=${genreId}&sort_by=popularity.desc&include_adult=false&page=1`;

    const res = await fetch(url);
    const data = await res.json();

    // filter
    const valid = (data.results || []).filter(
      (m) => m.backdrop_path && m.original_title
    );

    return valid.slice(0, 12); // enough for quiz
  }

  // ✅ Preload image
  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      imgPreloadRef.current = img;
    });
  }

  // ✅ Build question options
  function buildOptions(list, correctMovie) {
    const others = list
      .filter((m) => m.id !== correctMovie.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const all = [...others, correctMovie].sort(() => 0.5 - Math.random());
    return all.map((m) => ({
      id: m.id,
      title: m.title,
    }));
  }

  // ✅ Start quiz after choosing genre
  async function startGenre(g) {
    setGenre(g);
    setStage("intro");

    setQuestions([]);
    setCurrent(0);
    setScore(0);

    setHintLeft(3);
    setRemoveLeft(3);

    setHintText("");
    setRemoved([]);
    setLocked(false);
    setSelected(null);
    setRoundStarted(false);
    setTimer(20);
    setImgReady(false);

    const movies = await fetchMoviesByGenre(g.id);

    // build quiz questions by random
    const shuffled = movies.sort(() => 0.5 - Math.random()).slice(0, 8);
    setQuestions(shuffled);

    setStage("playing");
  }

  // ✅ When current question changes
  useEffect(() => {
    if (!questions.length) return;

    const q = questions[current];
    if (!q) return;

    // reset per question
    setHintText("");
    setRemoved([]);
    setSelected(null);
    setLocked(false);
    setRoundStarted(false);
    setTimer(20);
    setImgReady(false);

    // options
    setCorrect(q.title);
    setOptions(buildOptions(questions, q));

    // preload image BEFORE starting timer
    const src = TMDB_IMG + q.backdrop_path;
    preloadImage(src).then(() => setImgReady(true));
  }, [questions, current]);

  // ✅ Timer: starts ONLY after roundStarted + image ready
  useEffect(() => {
    if (!roundStarted || !imgReady || locked) return;

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          autoFail();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [roundStarted, imgReady, locked]);

  function autoFail() {
    setLocked(true);
    setSelected("timeout");

    setTimeout(() => {
      // no auto next, must click next
    }, 400);
  }

  // ✅ Handle answer
  function chooseAnswer(opt) {
    if (!roundStarted || locked) return;

    setLocked(true);
    setSelected(opt.title);

    const isCorrect = opt.title === correct;

    if (isCorrect) {
      setScore((s) => s + 1);

      // confetti small
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.75 },
      });

      // haptic on mobile
      if (navigator.vibrate) navigator.vibrate(80);
    } else {
      if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
    }
  }

  // ✅ Hint (Year + rating)
  function useHint() {
    if (!roundStarted || locked || hintLeft <= 0) return;

    const q = questions[current];
    const year = (q.release_date || "").slice(0, 4) || "—";
    const rate = q.vote_average ? q.vote_average.toFixed(1) : "—";

    setHintText(
      lang === "ar"
        ? `📌 سنة الإصدار: ${year} — ⭐ التقييم: ${rate}`
        : `📌 Year: ${year} — ⭐ Rating: ${rate}`
    );

    setHintLeft((h) => h - 1);
  }

  // ✅ Remove 2 wrong options
  function removeTwo() {
    if (!roundStarted || locked || removeLeft <= 0) return;

    const wrong = options.filter((o) => o.title !== correct);
    const removedNow = wrong.sort(() => 0.5 - Math.random()).slice(0, 2);

    setRemoved(removedNow.map((r) => r.id));
    setRemoveLeft((r) => r - 1);
  }

  // ✅ Next question
  function nextQuestion() {
    if (!questions.length) return;
    if (!locked) return; // must answer or timeout first

    const isLast = current === questions.length - 1;

    if (isLast) {
      setStage("result");
      return;
    }

    setCurrent((c) => c + 1);
  }

  // ✅ Restart
  function restart() {
    setStage("choose");
    setGenre(null);
    setQuestions([]);
    setCurrent(0);
    setOptions([]);
    setCorrect(null);
    setSelected(null);
    setLocked(false);
    setScore(0);
    setHintLeft(3);
    setRemoveLeft(3);
    setHintText("");
    setRemoved([]);
    setRoundStarted(false);
    setTimer(20);
    setImgReady(false);
  }

  const currentQ = questions[current];

  return (
    <div className="min-h-screen px-4 pb-24 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-10">
        {/* ✅ Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed">
            {t.sub}
          </p>
        </div>

        {/* ✅ CHOOSE CATEGORY */}
        {stage === "choose" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              {t.choose}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GENRES.map((g) => (
                <motion.button
                  key={g.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGenre(g)}
                  className="relative overflow-hidden rounded-3xl p-5 bg-zinc-900/40 border border-white/10 backdrop-blur-xl shadow-xl hover:border-red-500/40 transition"
                >
                  <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-red-600/30 via-transparent to-purple-500/20" />
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">{g.emoji}</span>
                    <span className="font-extrabold text-lg">
                      {lang === "ar" ? g.labelAr : g.labelEn}
                    </span>
                    <span className="text-xs text-gray-400">
                      {lang === "ar"
                        ? "اضغط للبدء"
                        : "Tap to start"}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ✅ PLAYING */}
        {stage === "playing" && currentQ && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl mx-auto"
          >
            {/* ✅ Top bar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="text-sm bg-zinc-900/40 border border-white/10 rounded-2xl px-4 py-2">
                🎯 {t.score}:{" "}
                <span className="font-bold text-white">{score}</span>
              </div>

              <div className="text-sm bg-zinc-900/40 border border-white/10 rounded-2xl px-4 py-2">
                ⏳ {t.time}:{" "}
                <span className="font-bold text-white">{timer}s</span>
              </div>

              <div className="text-sm bg-zinc-900/40 border border-white/10 rounded-2xl px-4 py-2 hidden md:block">
                {genre?.emoji} {lang === "ar" ? genre?.labelAr : genre?.labelEn}
              </div>
            </div>

            {/* ✅ Image card */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950/40 backdrop-blur-xl shadow-2xl">
              {/* Image */}
              {imgReady ? (
                <img
                  src={TMDB_IMG + currentQ.backdrop_path}
                  alt="movie"
                  className={`w-full h-60 md:h-[380px] object-cover transition duration-500 ${
                    roundStarted
                      ? "blur-0 brightness-100"
                      : "blur-2xl brightness-50 scale-110"
                  }`}
                />
              ) : (
                <div className="w-full h-60 md:h-[380px] flex items-center justify-center text-gray-400">
                  {t.loading}
                </div>
              )}

              {/* ✅ Overlay before round start */}
              {!roundStarted && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                  <p className="text-gray-100 text-lg font-semibold">
                    {lang === "ar"
                      ? "اضغط (ابدأ الجولة) للكشف"
                      : "Press (Start Round) to reveal"}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRoundStarted(true)}
                    className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 font-extrabold shadow-xl text-lg"
                  >
                    {t.start}
                  </motion.button>
                </div>
              )}

              {/* ✅ Small feedback under image */}
              <AnimatePresence>
                {locked && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <div className="rounded-2xl px-5 py-4 bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-lg">
                      {selected === correct ? (
                        <p className="font-bold text-green-400">{t.correct}</p>
                      ) : (
                        <p className="font-bold text-red-400">{t.wrong}</p>
                      )}

                      <p className="text-gray-300 text-sm mt-1">
                        {t.answer}{" "}
                        <span className="font-bold text-white">{correct}</span>
                      </p>

                      {/* ✅ NEXT button ONLY here */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextQuestion}
                        className="mt-3 w-full px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl"
                      >
                        {t.next}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ✅ Helps (Only after round starts) */}
            {roundStarted && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={useHint}
                  disabled={hintLeft <= 0 || locked}
                  className={`rounded-2xl px-4 py-3 font-bold border backdrop-blur-xl transition ${
                    hintLeft <= 0 || locked
                      ? "bg-zinc-900/20 border-white/5 text-gray-500"
                      : "bg-zinc-900/40 border-white/10 text-white hover:border-red-500/40"
                  }`}
                >
                  💡 {t.hint} ({hintLeft})
                  <div className="text-xs font-normal text-gray-400 mt-1">
                    {t.hintDesc} • {t.limited}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={removeTwo}
                  disabled={removeLeft <= 0 || locked}
                  className={`rounded-2xl px-4 py-3 font-bold border backdrop-blur-xl transition ${
                    removeLeft <= 0 || locked
                      ? "bg-zinc-900/20 border-white/5 text-gray-500"
                      : "bg-zinc-900/40 border-white/10 text-white hover:border-red-500/40"
                  }`}
                >
                  ❌ {t.remove2} ({removeLeft})
                  <div className="text-xs font-normal text-gray-400 mt-1">
                    {t.removeDesc} • {t.limited}
                  </div>
                </motion.button>
              </div>
            )}

            {/* ✅ Hint text */}
            {hintText && roundStarted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-zinc-900/40 border border-white/10 rounded-2xl px-5 py-3 text-gray-200"
              >
                {hintText}
              </motion.div>
            )}

            {/* ✅ Options (Only after round starts) */}
            {roundStarted && (
              <div className="mt-6 space-y-3">
                {options.map((opt) => {
                  const disabled =
                    locked || removed.includes(opt.id) || !roundStarted;

                  const isCorrectChoice = locked && opt.title === correct;
                  const isWrongChoice = locked && selected === opt.title;

                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={!disabled ? { scale: 1.01 } : {}}
                      whileTap={!disabled ? { scale: 0.98 } : {}}
                      onClick={() => chooseAnswer(opt)}
                      disabled={disabled}
                      className={`w-full px-6 py-4 rounded-3xl border text-lg font-bold transition backdrop-blur-xl ${
                        disabled
                          ? "bg-zinc-900/20 border-white/5 text-gray-600"
                          : "bg-zinc-900/40 border-white/10 text-white hover:border-red-500/40"
                      } ${
                        isCorrectChoice
                          ? "bg-green-600/25 border-green-500/40 text-green-200"
                          : ""
                      } ${
                        isWrongChoice
                          ? "bg-red-600/25 border-red-500/40 text-red-200"
                          : ""
                      }`}
                    >
                      {opt.title}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* ✅ Footer info */}
            <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
              <span>
                {lang === "ar"
                  ? `سؤال ${current + 1} من ${questions.length}`
                  : `Question ${current + 1} of ${questions.length}`}
              </span>

              <button
                onClick={restart}
                className="underline underline-offset-4 hover:text-white"
              >
                {t.back}
              </button>
            </div>
          </motion.div>
        )}

        {/* ✅ RESULT */}
        {stage === "result" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-3xl font-extrabold">{t.finishTitle}</h2>
              <p className="text-gray-300 mt-3">{t.finishDesc}</p>

              <div className="mt-6 text-6xl font-black text-red-500">
                {score}/{questions.length}
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={restart}
                  className="px-7 py-4 rounded-2xl bg-red-600 hover:bg-red-700 font-extrabold shadow-xl transition"
                >
                  {t.playAgain}
                </button>

                <button
                  onClick={() => setStage("choose")}
                  className="px-7 py-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 font-bold transition"
                >
                  {t.back}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
