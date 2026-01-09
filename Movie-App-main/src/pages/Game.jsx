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

const RANKS = [
  { min: 0, name: "Bronze", ar: "برونزي", color: "from-orange-400 to-yellow-600", emoji: "🥉" },
  { min: 120, name: "Silver", ar: "فضي", color: "from-gray-200 to-gray-500", emoji: "🥈" },
  { min: 220, name: "Gold", ar: "ذهبي", color: "from-yellow-300 to-orange-500", emoji: "🥇" },
  { min: 350, name: "Legend", ar: "أسطوري", color: "from-red-500 to-fuchsia-500", emoji: "👑" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getRank(score) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.min) rank = r;
  }
  return rank;
}

function vibrate(ms = 40) {
  if (navigator.vibrate) navigator.vibrate(ms);
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

  const [step, setStep] = useState("pick"); // pick | play | end | board
  const [genre, setGenre] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const currentQ = questions[current];

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [time, setTime] = useState(DIFFICULTIES[difficulty].time);
  const timerRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);

  const [hintUsed, setHintUsed] = useState(false);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const [removeTwoUsed, setRemoveTwoUsed] = useState(false);
  const [removedOptions, setRemovedOptions] = useState([]);

  const [perfect, setPerfect] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem("cine_player") || "");

  // ✅ Sounds
  const playCorrect = useSound("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3", 0.7);
  const playWrong = useSound("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3", 0.7);
  const playTick = useSound("https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-switch-2586.mp3", 0.35);
  const playWin = useSound("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3", 0.65);

  const bestScore = useMemo(() => Number(localStorage.getItem("cine_best_score") || 0), [step]);
  const today = todayKey();

  const dailyKey = useMemo(() => `cine_daily_${today}`, [today]);
  const dailyScoreKey = useMemo(() => `cine_daily_score_${today}`, [today]);

  const rank = useMemo(() => getRank(score), [score]);

  // ✅ Daily Challenge Genre (rotates automatically)
  const dailyGenre = useMemo(() => {
    const index = Math.floor(new Date(today).getTime() / 86400000) % GENRES.length;
    return GENRES[index];
  }, [today]);

  async function startQuiz(selectedGenre, isDaily = false) {
    setGenre(selectedGenre);
    setStep("play");
    resetGame();
    if (isDaily) {
      localStorage.setItem(dailyKey, "started");
    }
    await fetchQuestions(selectedGenre.id);
  }

  function resetGame() {
    setScore(0);
    setStreak(0);
    setXp(0);
    setLevel(1);
    setCurrent(0);
    setQuestions([]);
    setOptions([]);
    setSelected(null);
    setAnswerLocked(false);
    setHintUsed(false);
    setExtraTimeUsed(false);
    setRemoveTwoUsed(false);
    setRemovedOptions([]);
    setPerfect(false);
    setDailyCompleted(false);
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

  // ✅ Prepare options
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
      questions.filter((q) => q.id !== currentQ.id).map((q) => q.title).slice(0, 3)
    );

    setOptions(shuffle([correctTitle, ...wrongTitles]));

    // ✅ Preload next image
    const next = questions[current + 1];
    if (next?.backdrop_path) {
      const img = new Image();
      img.src = TMDB_IMG + next.backdrop_path;
    }
  }, [current, currentQ]);

  // ✅ Timer starts after image loaded
  useEffect(() => {
    if (!currentQ || !imageLoaded) return;

    clearInterval(timerRef.current);
    setTime(DIFFICULTIES[difficulty].time);
    setPerfect(true);

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
    setPerfect(false);
    setTimeout(() => nextQuestion(), 1100);
  }

  function calcPoints() {
    const base = DIFFICULTIES[difficulty].points;
    const combo = streak >= 2 ? Math.floor(base * (1 + streak * 0.1)) : base;
    const perfectBonus = perfect ? 8 : 0;
    return combo + perfectBonus;
  }

  function winConfetti() {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.55 } });
  }

  function saveToLeaderboard(finalScore) {
    const name = playerName.trim() || "Guest";
    const entry = {
      name,
      score: finalScore,
      date: new Date().toISOString(),
      genre: genre?.en || "Unknown",
      diff: difficulty,
    };

    const board = JSON.parse(localStorage.getItem("cine_leaderboard") || "[]");
    const updated = [entry, ...board].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem("cine_leaderboard", JSON.stringify(updated));
  }

  function handleAnswer(opt) {
    if (answerLocked) return;
    setAnswerLocked(true);
    setSelected(opt);

    const isCorrect = opt === currentQ.title;

    if (!isCorrect) {
      setPerfect(false);
      setStreak(0);
      playWrong();
      vibrate(80);
    } else {
      playCorrect();
      vibrate(40);

      const pts = calcPoints();
      setScore((s) => s + pts);
      setStreak((st) => st + 1);
      setXp((x) => x + 12);

      if (streak + 1 >= 3) winConfetti();
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
    if (score > oldBest) localStorage.setItem("cine_best_score", String(score));

    // ✅ Save daily
    if (genre?.id === dailyGenre.id) {
      localStorage.setItem(dailyScoreKey, String(score));
      setDailyCompleted(true);
    }

    saveToLeaderboard(score);
    playWin();
    winConfetti();
  }

  function restart() {
    setStep("pick");
    setGenre(null);
    resetGame();
  }

  function showBoard() {
    setStep("board");
  }

  // ✅ Power Ups
  function useHint() {
    if (hintUsed || answerLocked) return;
    setHintUsed(true);
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

  // ✅ Leveling
  useEffect(() => {
    if (xp >= 100) {
      setLevel((l) => l + 1);
      setXp((x) => x - 100);
      winConfetti();
    }
  }, [xp]);

  const title = lang === "ar" ? "🎬 خمن الفيلم — نسخة احترافية" : "🎬 Guess The Movie — Pro Edition";
  const desc =
    lang === "ar"
      ? "اختر الفئة والصعوبة، اجمع نقاط، افتح رتب، وتحدَّ يومك!"
      : "Pick category & difficulty, score points, unlock ranks, and complete Daily Challenge!";

  const board = useMemo(() => {
    return JSON.parse(localStorage.getItem("cine_leaderboard") || "[]");
  }, [step]);

  const dailyScore = Number(localStorage.getItem(dailyScoreKey) || 0);

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white relative overflow-hidden">
      {/* Animated cinematic background */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-red-600/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-fuchsia-600/25 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto pt-12 relative z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-gray-300 mt-3 leading-relaxed">{desc}</p>

        {/* PLAYER NAME */}
        {step === "pick" && (
          <div className="mt-6 max-w-md">
            <label className="text-sm text-gray-300">
              {lang === "ar" ? "اسم اللاعب (للوحة الصدارة)" : "Player name (Leaderboard)"}
            </label>
            <input
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                localStorage.setItem("cine_player", e.target.value);
              }}
              placeholder={lang === "ar" ? "مثلاً: Omar" : "e.g. Omar"}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 outline-none focus:border-red-500 transition"
            />
          </div>
        )}

        {/* STEP PICK */}
        {step === "pick" && (
          <div className="mt-10 space-y-10">
            {/* Daily Challenge */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-red-600/40 via-transparent to-white/10" />
              <div className="relative">
                <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
                  ⚡ {lang === "ar" ? "تحدي اليوم" : "Daily Challenge"}
                </h2>
                <p className="text-gray-300 mt-2">
                  {lang === "ar"
                    ? `اليوم الفئة هي: ${dailyGenre.ar} — العب واربح لقب خاص!`
                    : `Today’s category: ${dailyGenre.en} — Play and earn a special badge!`}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => startQuiz(dailyGenre, true)}
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-xl"
                  >
                    {lang === "ar" ? "ابدأ تحدي اليوم" : "Start Daily Challenge"}
                  </button>

                  <div className="text-sm text-gray-300">
                    ✅ {lang === "ar" ? "نتيجة اليوم" : "Today score"}:{" "}
                    <b className="text-white">{dailyScore}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="text-xl font-bold mb-4">{lang === "ar" ? "اختر الصعوبة" : "Choose Difficulty"}</h2>
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
                      <div className="text-xs text-gray-300 mt-1">⏱ {di.time}s · ⭐ {di.points} pts</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h2 className="text-xl font-bold mb-4">{lang === "ar" ? "اختر فئة الأفلام" : "Choose Category"}</h2>
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
                      <div className="text-base font-bold">{lang === "ar" ? g.ar : g.en}</div>
                      <div className="text-xs text-gray-400 mt-1">{lang === "ar" ? "10 أسئلة" : "10 questions"}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Best + Leaderboard */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-300">
              <div>
                🏆 {lang === "ar" ? "أفضل نتيجة" : "Best Score"}:{" "}
                <b className="text-white">{bestScore}</b>
              </div>

              <button
                onClick={showBoard}
                className="px-5 py-3 rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-800 transition font-semibold"
              >
                🏁 {lang === "ar" ? "لوحة الصدارة" : "Leaderboard"}
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {step === "play" && loadingQ && (
          <div className="mt-12 text-center text-gray-400">
            {lang === "ar" ? "⏳ جاري تجهيز الأسئلة..." : "⏳ Preparing questions..."}
          </div>
        )}

        {/* PLAY */}
        {step === "play" && !loadingQ && currentQ && (
          <div className="mt-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="text-sm text-gray-300">
                {lang === "ar" ? "السؤال" : "Question"} {current + 1}/{questions.length} ·{" "}
                {lang === "ar" ? "المستوى" : "Level"} <b className="text-white">{level}</b>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300">
                🔥 <b className="text-white">{streak}</b>
                <span className="text-gray-500">|</span>
                ⭐ <b className="text-white">{score}</b>
                <span className="text-gray-500">|</span>
                {rank.emoji}{" "}
                <span className={`bg-gradient-to-r ${rank.color} text-black px-3 py-1 rounded-full font-bold`}>
                  {lang === "ar" ? rank.ar : rank.name}
                </span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
              <div className="h-full bg-fuchsia-500 transition-all" style={{ width: `${xp}%` }} />
            </div>

            {/* Image Card */}
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

              <div className="absolute top-3 right-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/10 text-sm font-bold">
                ⏱ {time}s
              </div>

              <div className="absolute top-3 left-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/10 text-sm font-bold">
                ⚡ XP {xp}/100
              </div>

              {perfect && (
                <div className="absolute bottom-3 left-3 bg-green-500/90 text-black px-4 py-2 rounded-2xl font-extrabold shadow-xl">
                  ✅ {lang === "ar" ? "Perfect!" : "Perfect!"}
                </div>
              )}
            </div>

            {/* Power Ups */}
            <div className="grid grid-cols-3 gap-3">
              <PowerBtn disabled={hintUsed || answerLocked} onClick={() => setHintUsed(true)} label={lang === "ar" ? "🧠 تلميح" : "🧠 Hint"} />
              <PowerBtn disabled={extraTimeUsed || answerLocked} onClick={() => { setExtraTimeUsed(true); setTime((t) => t + 6); }} label={lang === "ar" ? "⏱ +6 ثواني" : "⏱ +6 sec"} />
              <PowerBtn disabled={removeTwoUsed || answerLocked} onClick={() => { setRemoveTwoUsed(true); const wrongs = options.filter((o) => o !== currentQ.title); setRemovedOptions(shuffle(wrongs).slice(0, 2)); }} label={lang === "ar" ? "❌ حذف خيارين" : "❌ Remove 2"} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt) => {
                if (removedOptions.includes(opt)) return null;

                const isCorrect = opt === currentQ.title;
                const isChosen = selected === opt;
                const hintSelected = hintUsed && isCorrect && !answerLocked;

                let style = "bg-zinc-900/40 text-gray-200 border-white/10 hover:bg-zinc-800";

                if (answerLocked) {
                  if (isCorrect) style = "bg-green-600/80 border-green-400";
                  else if (isChosen) style = "bg-red-600/80 border-red-400";
                  else style = "bg-zinc-900/30 border-white/10 text-gray-400";
                }

                if (hintSelected) {
                  style = "bg-yellow-500/80 border-yellow-300 text-black shadow-xl shadow-yellow-500/20";
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
          </div>
        )}

        {/* END */}
        {step === "end" && (
          <div className="mt-14 text-center space-y-6">
            <h2 className="text-3xl font-extrabold">{lang === "ar" ? "🏆 انتهت اللعبة!" : "🏆 Game Finished!"}</h2>
            <p className="text-gray-300">
              {lang === "ar" ? "نتيجتك" : "Your Score"}: <b className="text-white">{score}</b>
            </p>

            <div className="inline-flex items-center gap-3">
              <span className={`bg-gradient-to-r ${rank.color} text-black px-4 py-2 rounded-full font-bold`}>
                {rank.emoji} {lang === "ar" ? rank.ar : rank.name}
              </span>

              {dailyCompleted && (
                <span className="bg-green-500/80 text-black px-4 py-2 rounded-full font-bold">
                  ✅ {lang === "ar" ? "بطل تحدي اليوم!" : "Daily Champion!"}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={restart}
                className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-xl"
              >
                {lang === "ar" ? "🔁 العب من جديد" : "🔁 Play Again"}
              </motion.button>

              <button
                onClick={showBoard}
                className="px-8 py-4 rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-800 transition font-bold shadow-xl"
              >
                🏁 {lang === "ar" ? "لوحة الصدارة" : "Leaderboard"}
              </button>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {step === "board" && (
          <div className="mt-12 space-y-5">
            <h2 className="text-3xl font-extrabold">🏁 {lang === "ar" ? "لوحة الصدارة" : "Leaderboard"}</h2>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-xl p-6 shadow-xl">
              {board.length === 0 ? (
                <p className="text-gray-400">{lang === "ar" ? "لا توجد نتائج بعد." : "No scores yet."}</p>
              ) : (
                <div className="space-y-3">
                  {board.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-zinc-950/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-bold">#{idx + 1}</span>
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            {p.genre} · {p.diff}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-red-400">{p.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={restart}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-xl"
            >
              {lang === "ar" ? "⬅ رجوع" : "⬅ Back"}
            </button>
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
