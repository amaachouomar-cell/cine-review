import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";

const DIFFICULTIES = {
  easy: { time: 20, points: 10, labelAr: "سهل", labelEn: "Easy", emoji: "🟢" },
  medium: { time: 16, points: 15, labelAr: "متوسط", labelEn: "Medium", emoji: "🟡" },
  hard: { time: 12, points: 25, labelAr: "صعب", labelEn: "Hard", emoji: "🔴" },
};

const GENRES = [
  { id: 28, ar: "أكشن", en: "Action", emoji: "💥" },
  { id: 35, ar: "كوميديا", en: "Comedy", emoji: "😂" },
  { id: 18, ar: "دراما", en: "Drama", emoji: "🎭" },
  { id: 27, ar: "رعب", en: "Horror", emoji: "👻" },
  { id: 10749, ar: "رومانسي", en: "Romance", emoji: "❤️" },
  { id: 9648, ar: "غموض", en: "Mystery", emoji: "🕵️‍♂️" },
  { id: 16, ar: "أنيميشن", en: "Animation", emoji: "🎨" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function useSound(url, vol = 0.6) {
  const audioRef = useRef(null);
  useEffect(() => {
    const a = new Audio(url);
    a.volume = vol;
    audioRef.current = a;
  }, [url, vol]);

  return () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };
}

export default function Quiz() {
  const { lang } = useLang();

  // ✅ Steps
  const [step, setStep] = useState("pick"); 
  // pick | play | end

  const [genre, setGenre] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");

  // ✅ Quiz Data
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const currentQ = questions[current];

  // ✅ Game States
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  // ✅ Timer
  const [time, setTime] = useState(DIFFICULTIES[difficulty].time);
  const timerRef = useRef(null);

  // ✅ Loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);

  // ✅ Power Ups
  const [hintUsed, setHintUsed] = useState(false);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const [removeTwoUsed, setRemoveTwoUsed] = useState(false);
  const [removedOptions, setRemovedOptions] = useState([]);

  // ✅ Best Score
  const bestScore = useMemo(() => {
    return Number(localStorage.getItem("cine_best_score") || 0);
  }, [step]);

  // ✅ Sounds (يمكنك تغيير الملفات بصوتك)
  const playCorrect = useSound("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3", 0.7);
  const playWrong = useSound("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3", 0.7);
  const playTick = useSound("https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-switch-2586.mp3", 0.35);
  const playWin = useSound("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3", 0.65);

  // ✅ Start
  async function startQuiz(selectedGenre) {
    setGenre(selectedGenre);
    setStep("play");
    resetGame();
    await fetchQuestions(selectedGenre.id);
  }

  function resetGame() {
    setScore(0);
    setStreak(0);
    setXp(0);
    setCurrent(0);
    setQuestions([]);
    setOptions([]);
    setSelected(null);
    setAnswerLocked(false);
    setHintUsed(false);
    setExtraTimeUsed(false);
    setRemoveTwoUsed(false);
    setRemovedOptions([]);
  }

  async function fetchQuestions(genreId) {
    try {
      setLoadingQ(true);
      const key = import.meta.env.VITE_TMDB_API_KEY;

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
      );

      const data = await res.json();
      const picked = shuffle(data.results).slice(0, 10);

      setQuestions(picked);
      setLoadingQ(false);
    } catch (err) {
      console.error(err);
      setLoadingQ(false);
    }
  }

  // ✅ Prepare options on question change
  useEffect(() => {
    if (!currentQ) return;

    setImageLoaded(false);
    setAnswerLocked(false);
    setSelected(null);
    setRemovedOptions([]);

    setHintUsed(false);
    setExtraTimeUsed(false);
    setRemoveTwoUsed(false);

    const correctTitle = currentQ.title;
    const wrongTitles = shuffle(
      questions
        .filter((q) => q.id !== currentQ.id)
        .map((q) => q.title)
        .slice(0, 3)
    );

    setOptions(shuffle([correctTitle, ...wrongTitles]));

    // ✅ Preload next
    const next = questions[current + 1];
    if (next?.backdrop_path) {
      const img = new Image();
      img.src = TMDB_IMG + next.backdrop_path;
    }
  }, [current, currentQ]);

  // ✅ Timer only after imageLoaded
  useEffect(() => {
    if (!currentQ || !imageLoaded) return;

    clearInterval(timerRef.current);
    setTime(DIFFICULTIES[difficulty].time);

    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 4) playTick();
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [imageLoaded, currentQ, difficulty]);

  function handleTimeout() {
    if (answerLocked) return;
    setAnswerLocked(true);
    setSelected("timeout");
    setStreak(0);

    setTimeout(() => nextQuestion(), 1200);
  }

  function calcPoints() {
    const base = DIFFICULTIES[difficulty].points;
    const combo = streak >= 2 ? Math.floor(base * (1 + streak * 0.08)) : base;
    return combo;
  }

  function winConfetti() {
    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.55 },
    });
  }

  function handleAnswer(opt) {
    if (answerLocked) return;

    setAnswerLocked(true);
    setSelected(opt);

    const isCorrect = opt === currentQ.title;

    if (isCorrect) {
      playCorrect();
      const pts = calcPoints();

      setScore((s) => s + pts);
      setStreak((st) => st + 1);
      setXp((x) => x + 12);

      if (streak + 1 >= 3) {
        winConfetti();
      }
    } else {
      playWrong();
      setStreak(0);
    }

    setTimeout(() => nextQuestion(), 1200);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      endGame();
      return;
    }
    setCurrent((c) => c + 1);
  }

  function endGame() {
    setStep("end");
    clearInterval(timerRef.current);

    const oldBest = Number(localStorage.getItem("cine_best_score") || 0);
    if (score > oldBest) {
      localStorage.setItem("cine_best_score", String(score));
    }

    playWin();
    winConfetti();
  }

  function restart() {
    setStep("pick");
    setGenre(null);
    resetGame();
  }

  // ✅ Power Ups
  function useHint() {
    if (hintUsed || answerLocked) return;
    setHintUsed(true);
    // hint: highlight correct option
    setSelected("hint");
  }

  function useExtraTime() {
    if (extraTimeUsed || answerLocked) return;
    setExtraTimeUsed(true);
    setTime((t) => t + 6);
  }

  function useRemoveTwo() {
    if (removeTwoUsed || answerLocked) return;
    setRemoveTwoUsed(true);
    const wrongs = options.filter((o) => o !== currentQ.title);
    setRemovedOptions(shuffle(wrongs).slice(0, 2));
  }

  // ✅ UI Text
  const title = lang === "ar" ? "🎬 خمن الفيلم (Pro)" : "🎬 Guess The Movie (Pro)";
  const desc =
    lang === "ar"
      ? "اختر فئة + صعوبة، ثم خمن الفيلم من الصورة! لديك أدوات مساعدة وCombo!"
      : "Pick a category + difficulty, then guess the movie! Use power-ups & build combos!";

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="text-gray-300 mt-3 leading-relaxed">{desc}</p>

        {/* ✅ STEP PICK */}
        {step === "pick" && (
          <div className="mt-10 space-y-8">
            {/* Difficulty */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                {lang === "ar" ? "اختر الصعوبة" : "Choose Difficulty"}
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {Object.keys(DIFFICULTIES).map((d) => {
                  const di = DIFFICULTIES[d];
                  const active = difficulty === d;
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-2xl border px-4 py-4 font-bold shadow-lg transition ${
                        active
                          ? "bg-red-600/90 border-red-500"
                          : "bg-zinc-900/40 border-white/10 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="text-2xl">{di.emoji}</div>
                      <div>{lang === "ar" ? di.labelAr : di.labelEn}</div>
                      <div className="text-xs text-gray-300 mt-1">
                        ⏱ {di.time}s · ⭐ {di.points} pts
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                {lang === "ar" ? "اختر فئة الأفلام" : "Choose Category"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GENRES.map((g) => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(g)}
                    className="rounded-3xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-800 transition px-4 py-5 font-semibold shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-red-600/40 via-transparent to-white/10" />
                    <div className="relative">
                      <div className="text-3xl mb-2">{g.emoji}</div>
                      <div className="text-base font-bold">
                        {lang === "ar" ? g.ar : g.en}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {lang === "ar" ? "10 أسئلة" : "10 questions"}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Best Score */}
            <div className="text-center text-sm text-gray-400">
              🏆 {lang === "ar" ? "أفضل نتيجة" : "Best Score"}:{" "}
              <b className="text-white">{bestScore}</b>
            </div>
          </div>
        )}

        {/* ✅ LOADING */}
        {step === "play" && loadingQ && (
          <div className="mt-12 text-center text-gray-400">
            {lang === "ar" ? "⏳ جاري تجهيز الأسئلة..." : "⏳ Preparing questions..."}
          </div>
        )}

        {/* ✅ PLAY */}
        {step === "play" && !loadingQ && currentQ && (
          <div className="mt-10 space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>
                {lang === "ar" ? "السؤال" : "Question"} {current + 1} /{" "}
                {questions.length}
              </span>

              <span className="flex items-center gap-2">
                🔥 <b className="text-white">{streak}</b>
                <span className="text-gray-500">|</span>
                ⭐ <b className="text-white">{score}</b>
              </span>
            </div>

            {/* Progress */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Image */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/30 relative shadow-xl">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[220px] md:h-[360px] bg-zinc-900/60 animate-pulse flex items-center justify-center text-gray-400">
                    {lang === "ar" ? "📸 تحميل الصورة..." : "📸 Loading image..."}
                  </div>
                </div>
              )}

              <img
                src={TMDB_IMG + currentQ.backdrop_path}
                alt="quiz"
                className={`w-full h-[220px] md:h-[360px] object-cover transition ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />

              {/* Timer */}
              <div className="absolute top-3 right-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/10 text-sm font-bold">
                ⏱ {time}s
              </div>

              {/* XP */}
              <div className="absolute top-3 left-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/10 text-sm font-bold">
                ⚡ XP {xp}
              </div>
            </div>

            {/* Power Ups */}
            <div className="grid grid-cols-3 gap-3">
              <PowerBtn
                disabled={hintUsed || answerLocked}
                onClick={useHint}
                label={lang === "ar" ? "🧠 تلميح" : "🧠 Hint"}
              />
              <PowerBtn
                disabled={extraTimeUsed || answerLocked}
                onClick={useExtraTime}
                label={lang === "ar" ? "⏱ +6 ثواني" : "⏱ +6 sec"}
              />
              <PowerBtn
                disabled={removeTwoUsed || answerLocked}
                onClick={useRemoveTwo}
                label={lang === "ar" ? "❌ حذف خيارين" : "❌ Remove 2"}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt) => {
                const isCorrect = opt === currentQ.title;
                const isRemoved = removedOptions.includes(opt);

                if (isRemoved) return null;

                const isChosen = selected === opt;
                const hintSelected = selected === "hint" && isCorrect;

                let style =
                  "bg-zinc-900/40 text-gray-200 border-white/10 hover:bg-zinc-800";

                if (answerLocked) {
                  if (isCorrect) style = "bg-green-600/80 border-green-400";
                  else if (isChosen) style = "bg-red-600/80 border-red-400";
                  else style = "bg-zinc-900/30 border-white/10 text-gray-400";
                }

                if (hintSelected) {
                  style =
                    "bg-yellow-500/80 border-yellow-300 text-black shadow-xl shadow-yellow-500/20";
                }

                return (
                  <motion.button
                    key={opt}
                    whileHover={!answerLocked ? { scale: 1.02 } : {}}
                    whileTap={!answerLocked ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={answerLocked || !imageLoaded}
                    className={`px-5 py-4 rounded-2xl border font-semibold transition shadow-lg ${style}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 text-center">
              {lang === "ar"
                ? "⛔ المؤقت لا يبدأ حتى تحمل الصورة بالكامل. واستعمل Power-ups للربح!"
                : "⛔ Timer starts after the image loads. Use power-ups to win!"}
            </p>
          </div>
        )}

        {/* ✅ END */}
        {step === "end" && (
          <div className="mt-14 text-center space-y-5">
            <h2 className="text-3xl font-extrabold">
              {lang === "ar" ? "🏆 انتهت اللعبة!" : "🏆 Game Finished!"}
            </h2>

            <p className="text-gray-300">
              {lang === "ar" ? "نتيجتك" : "Your Score"}:{" "}
              <b className="text-white">{score}</b>
            </p>

            <p className="text-gray-500 text-sm">
              {lang === "ar" ? "أفضل نتيجة" : "Best Score"}:{" "}
              <b className="text-white">{bestScore}</b>
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={restart}
              className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-xl"
            >
              {lang === "ar" ? "🔁 العب من جديد" : "🔁 Play Again"}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

function PowerBtn({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-3 rounded-2xl border font-semibold transition shadow-lg text-sm ${
        disabled
          ? "bg-zinc-900/20 border-white/5 text-gray-500"
          : "bg-zinc-900/40 border-white/10 hover:bg-zinc-800 text-white"
      }`}
    >
      {label}
    </button>
  );
}
