import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";

const DIFFICULTIES = {
  easy: { time: 22, base: 10, labelAr: "سهل", labelEn: "Easy", emoji: "🟢" },
  medium: { time: 16, base: 15, labelAr: "متوسط", labelEn: "Medium", emoji: "🟡" },
  hard: { time: 12, base: 25, labelAr: "صعب", labelEn: "Hard", emoji: "🔴" },
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

function burst() {
  confetti({
    particleCount: 160,
    spread: 90,
    origin: { y: 0.7 },
  });
}

function calcRank(score) {
  if (score >= 240) return { rank: "S", color: "text-yellow-400", emoji: "👑" };
  if (score >= 180) return { rank: "A", color: "text-green-400", emoji: "🏆" };
  if (score >= 120) return { rank: "B", color: "text-blue-400", emoji: "🎖️" };
  return { rank: "C", color: "text-gray-400", emoji: "🙂" };
}

export default function Quiz() {
  const { lang } = useLang();

  const [step, setStep] = useState("pick"); // pick | play | end
  const [genre, setGenre] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const currentQ = questions[current];

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [time, setTime] = useState(DIFFICULTIES[difficulty].time);
  const [imgReady, setImgReady] = useState(false);

  const [loadingQ, setLoadingQ] = useState(false);

  const timerRef = useRef(null);

  // ✅ Premium Helps
  const [hintCount, setHintCount] = useState(3);
  const [removeTwoCount, setRemoveTwoCount] = useState(3);
  const [hintInfo, setHintInfo] = useState(null);
  const [removedOptions, setRemovedOptions] = useState([]);

  // ✅ Achievements
  const [achievements, setAchievements] = useState({
    firstWin: false,
    streak3: false,
    streak5: false,
    perfectRound: false,
  });

  // ✅ Premium Effects
  const [shake, setShake] = useState(false);
  const [resultState, setResultState] = useState(null); // correct | wrong | timeout
  const [toast, setToast] = useState(null);

  // ✅ sound
  const correctSfx = useMemo(() => new Audio("/sfx/correct.mp3"), []);
  const wrongSfx = useMemo(() => new Audio("/sfx/wrong.mp3"), []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  async function fetchQuestions(genreId) {
    try {
      setLoadingQ(true);
      const key = import.meta.env.VITE_TMDB_API_KEY;

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
      );

      const data = await res.json();

      const picked = shuffle(data.results)
        .filter((m) => m.backdrop_path)
        .slice(0, 12);

      setQuestions(picked);
      setLoadingQ(false);
    } catch (err) {
      console.error(err);
      setLoadingQ(false);
    }
  }

  async function startQuiz(selectedGenre) {
    setStep("play");
    setGenre(selectedGenre);

    setScore(0);
    setStreak(0);
    setCurrent(0);

    setHintCount(3);
    setRemoveTwoCount(3);

    setAchievements({
      firstWin: false,
      streak3: false,
      streak5: false,
      perfectRound: false,
    });

    await fetchQuestions(selectedGenre.id);
  }

  // ✅ Prepare question
  useEffect(() => {
    if (!currentQ) return;

    clearInterval(timerRef.current);

    setLocked(false);
    setSelected(null);
    setRevealed(false);
    setImgReady(false);

    setHintInfo(null);
    setRemovedOptions([]);

    setResultState(null);
    setShake(false);

    setTime(DIFFICULTIES[difficulty].time);

    const correct = currentQ.title;
    const wrong = shuffle(
      questions.filter((q) => q.id !== currentQ.id).map((q) => q.title)
    ).slice(0, 3);

    setOptions(shuffle([correct, ...wrong]));

    // ✅ preload image (but hidden)
    const img = new Image();
    img.src = TMDB_IMG + currentQ.backdrop_path;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true);
  }, [current, currentQ, difficulty]);

  // ✅ TIMEOUT
  function timeout() {
    if (locked) return;

    setLocked(true);
    setResultState("timeout");
    wrongSfx.volume = 0.35;
    wrongSfx.play().catch(() => {});

    setStreak(0);
    showToast(lang === "ar" ? "⏳ انتهى الوقت!" : "⏳ Time’s up!");
  }

  // ✅ Start round (reveal image + start timer)
  function startRound() {
    if (!imgReady) return;
    setRevealed(true);

    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  // ✅ Answer
  function handleAnswer(opt) {
    if (locked) return;

    clearInterval(timerRef.current);
    setLocked(true);
    setSelected(opt);

    const correct = opt === currentQ.title;

    if (correct) {
      correctSfx.volume = 0.35;
      correctSfx.play().catch(() => {});
      burst();

      setResultState("correct");

      const bonus = Math.floor(time * 0.6);
      const streakBonus = streak * 3;

      setScore((s) => s + DIFFICULTIES[difficulty].base + bonus + streakBonus);
      setStreak((st) => st + 1);

      // achievements
      setAchievements((a) => ({
        ...a,
        firstWin: true,
        streak3: streak + 1 >= 3 ? true : a.streak3,
        streak5: streak + 1 >= 5 ? true : a.streak5,
      }));

      showToast(lang === "ar" ? "🔥 رائع! إجابة صحيحة" : "🔥 Nice! Correct!");
    } else {
      wrongSfx.volume = 0.35;
      wrongSfx.play().catch(() => {});
      setResultState("wrong");
      setStreak(0);

      setShake(true);
      setTimeout(() => setShake(false), 450);
      showToast(lang === "ar" ? "❌ خطأ! حاول مرة أخرى" : "❌ Wrong! Try again");
    }
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      setStep("end");
      clearInterval(timerRef.current);

      // perfect achievement
      if (score >= 200) {
        setAchievements((a) => ({ ...a, perfectRound: true }));
      }
      return;
    }
    setCurrent((c) => c + 1);
  }

  // ✅ Hint: year + rating only
  function useHint() {
    if (hintCount <= 0 || locked || !revealed) return;

    setHintCount((c) => c - 1);

    const year = currentQ.release_date
      ? currentQ.release_date.split("-")[0]
      : "N/A";
    const rating = currentQ.vote_average
      ? currentQ.vote_average.toFixed(1)
      : "N/A";

    setHintInfo({ year, rating });
    showToast(lang === "ar" ? "✨ تلميح ظهر!" : "✨ Hint revealed!");
  }

  // ✅ Remove two options
  function useRemoveTwo() {
    if (removeTwoCount <= 0 || locked || !revealed) return;

    setRemoveTwoCount((c) => c - 1);

    const wrongs = options.filter((o) => o !== currentQ.title);
    setRemovedOptions(shuffle(wrongs).slice(0, 2));

    showToast(lang === "ar" ? "✅ تم حذف خيارين" : "✅ Two removed!");
  }

  // ✅ Progress bar percent
  const maxTime = DIFFICULTIES[difficulty].time;
  const percent = (time / maxTime) * 100;

  // ✅ Rank at end
  const rank = calcRank(score);

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-12">

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold">
              🎬 {lang === "ar" ? "خمن الفيلم" : "Guess The Movie"}
            </h1>
            <p className="text-gray-400 mt-2">
              {lang === "ar"
                ? "نسخة Premium: انتقالات + إنجازات + نقاط + مؤثرات."
                : "Premium edition: transitions, achievements, score & effects."}
            </p>
          </div>

          {/* Achievements mini */}
          <div className="hidden md:flex flex-col gap-2 text-xs text-gray-300">
            <Badge ok={achievements.firstWin} label={lang === "ar" ? "أول فوز" : "First Win"} />
            <Badge ok={achievements.streak3} label={lang === "ar" ? "3 صحيحة" : "3 Streak"} />
            <Badge ok={achievements.streak5} label={lang === "ar" ? "5 صحيحة" : "5 Streak"} />
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-black/70 border border-white/10 shadow-xl text-sm font-semibold backdrop-blur-xl"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PICK */}
        {step === "pick" && (
          <div className="mt-10 space-y-10">

            <div>
              <h2 className="text-xl font-bold mb-4">
                {lang === "ar" ? "اختر الصعوبة" : "Choose Difficulty"}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(DIFFICULTIES).map((d) => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-4 rounded-2xl border font-bold transition shadow-lg ${
                      difficulty === d
                        ? "bg-red-600 border-red-500"
                        : "bg-zinc-900/40 border-white/10 hover:bg-zinc-800"
                    }`}
                  >
                    {DIFFICULTIES[d].emoji}{" "}
                    {lang === "ar" ? DIFFICULTIES[d].labelAr : DIFFICULTIES[d].labelEn}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">
                {lang === "ar" ? "اختر الفئة" : "Choose Category"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GENRES.map((g) => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(g)}
                    className="px-4 py-6 rounded-3xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-800 shadow-xl text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-25 bg-gradient-to-br from-red-500/30 to-transparent" />
                    <div className="relative">
                      <div className="text-3xl">{g.emoji}</div>
                      <div className="font-bold mt-2">
                        {lang === "ar" ? g.ar : g.en}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* LOADING */}
        {step === "play" && loadingQ && (
          <div className="mt-12 text-center text-gray-400">
            {lang === "ar" ? "⏳ جاري تحميل الأسئلة..." : "⏳ Loading questions..."}
          </div>
        )}

        {/* PLAY */}
        {step === "play" && !loadingQ && currentQ && (
          <div className="mt-10 space-y-6">

            {/* top bar */}
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>
                {lang === "ar" ? "سؤال" : "Question"} {current + 1}/{questions.length}
              </span>
              <span>⭐ {score} | 🔥 {streak}</span>
            </div>

            {/* timer bar */}
            {revealed && (
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: percent + "%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-red-600"
                />
              </div>
            )}

            {/* IMAGE CARD */}
            <motion.div
              animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.35 }}
              className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 shadow-xl relative"
            >
              {!revealed && (
                <div className="h-[240px] md:h-[360px] relative flex items-center justify-center bg-black/40 overflow-hidden">
                  {/* blurred preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-black/40" />
                  <div className="absolute inset-0 backdrop-blur-2xl opacity-90" />

                  {/* skeleton */}
                  <div className="absolute inset-0 animate-pulse bg-white/5" />

                  <div className="relative text-center space-y-4 px-4">
                    <p className="text-lg font-semibold text-gray-200">
                      {lang === "ar"
                        ? "🎬 الصورة مخفية حتى تضغط التالي"
                        : "🎬 Image hidden until you press Next"}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={startRound}
                      disabled={!imgReady}
                      className="px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl disabled:opacity-40"
                    >
                      ➜ {lang === "ar" ? "التالي" : "Next"}
                    </motion.button>

                    <p className="text-xs text-gray-400">
                      {imgReady
                        ? lang === "ar"
                          ? "✅ جاهز!"
                          : "✅ Ready!"
                        : lang === "ar"
                        ? "تحميل الصورة..."
                        : "Loading image..."}
                    </p>
                  </div>
                </div>
              )}

              {revealed && (
                <motion.img
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={TMDB_IMG + currentQ.backdrop_path}
                  alt="movie"
                  className="w-full h-[240px] md:h-[360px] object-cover"
                />
              )}

              {revealed && (
                <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-2xl font-bold border border-white/10 shadow-xl">
                  ⏱ {time}s
                </div>
              )}
            </motion.div>

            {/* Hint Box */}
            {hintInfo && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-4 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-200"
              >
                🎯 {lang === "ar" ? "تلميح:" : "Hint:"}{" "}
                {lang === "ar"
                  ? `سنة الإصدار: ${hintInfo.year} | التقييم: ${hintInfo.rating}⭐`
                  : `Release Year: ${hintInfo.year} | Rating: ${hintInfo.rating}⭐`}
              </motion.div>
            )}

            {/* Powerups */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={useHint}
                disabled={hintCount <= 0 || locked || !revealed}
                className="px-3 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 hover:bg-zinc-800 transition font-bold disabled:opacity-40"
              >
                🧠 {lang === "ar" ? "تلميح" : "Hint"} ({hintCount})
              </button>

              <button
                onClick={useRemoveTwo}
                disabled={removeTwoCount <= 0 || locked || !revealed}
                className="px-3 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 hover:bg-zinc-800 transition font-bold disabled:opacity-40"
              >
                ❌ {lang === "ar" ? "حذف خيارين" : "Remove 2"} ({removeTwoCount})
              </button>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt) => {
                if (removedOptions.includes(opt)) return null;

                const correct = opt === currentQ.title;
                const isChosen = opt === selected;

                let style = "bg-zinc-900/40 border-white/10 hover:bg-zinc-800";

                if (locked) {
                  if (resultState === "correct") {
                    if (correct) style = "bg-green-600/80 border-green-400";
                    else style = "bg-zinc-900/30 border-white/10 text-gray-500";
                  } else {
                    if (correct) style = "bg-green-600/70 border-green-400";
                    else if (isChosen) style = "bg-red-600/80 border-red-400";
                    else style = "bg-zinc-900/30 border-white/10 text-gray-500";
                  }
                }

                return (
                  <motion.button
                    key={opt}
                    whileHover={!locked ? { scale: 1.02 } : {}}
                    whileTap={!locked ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={locked || !revealed}
                    className={`px-5 py-4 rounded-2xl border font-semibold transition shadow-lg ${style}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {/* Result / Next */}
            {locked && (
              <div className="mt-4 p-5 rounded-3xl border border-white/10 bg-zinc-900/40 shadow-xl text-center space-y-4">
                <h3 className="text-2xl font-extrabold">
                  {resultState === "correct"
                    ? lang === "ar"
                      ? "✅ صحيح!"
                      : "✅ Correct!"
                    : resultState === "timeout"
                    ? lang === "ar"
                      ? "⏳ انتهى الوقت!"
                      : "⏳ Time’s up!"
                    : lang === "ar"
                    ? "❌ خطأ!"
                    : "❌ Wrong!"}
                </h3>

                <p className="text-gray-300">
                  {lang === "ar" ? "الجواب الصحيح:" : "Correct answer:"}{" "}
                  <b className="text-green-400">{currentQ.title}</b>
                </p>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl"
                >
                  ➜ {lang === "ar" ? "التالي" : "Next"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* END */}
        {step === "end" && (
          <div className="mt-14 text-center space-y-6">
            <h2 className="text-4xl font-extrabold">
              🏁 {lang === "ar" ? "انتهت اللعبة!" : "Game Finished!"}
            </h2>

            <div className="text-lg text-gray-200">
              {lang === "ar" ? "نتيجتك:" : "Your Score:"}{" "}
              <b className="text-red-400">{score}</b>
            </div>

            <div className={`text-4xl font-extrabold ${rank.color}`}>
              {rank.emoji} Rank {rank.rank}
            </div>

            {/* Achievements */}
            <div className="max-w-xl mx-auto mt-6 grid grid-cols-2 gap-3 text-sm">
              <Ach ok={achievements.firstWin} text={lang === "ar" ? "أول فوز" : "First Win"} />
              <Ach ok={achievements.streak3} text={lang === "ar" ? "3 إجابات صحيحة" : "3 Win Streak"} />
              <Ach ok={achievements.streak5} text={lang === "ar" ? "5 إجابات صحيحة" : "5 Win Streak"} />
              <Ach ok={achievements.perfectRound} text={lang === "ar" ? "جولة قوية" : "Strong Round"} />
            </div>

            <button
              onClick={() => setStep("pick")}
              className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl"
            >
              🔁 {lang === "ar" ? "العب مجددًا" : "Play Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ ok, label }) {
  return (
    <div
      className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
        ok
          ? "bg-green-600/20 border-green-500/40 text-green-300"
          : "bg-zinc-900/40 border-white/10 text-gray-500"
      }`}
    >
      {ok ? "✅ " : "⬜ "} {label}
    </div>
  );
}

function Ach({ ok, text }) {
  return (
    <div
      className={`px-4 py-3 rounded-2xl border font-semibold ${
        ok
          ? "bg-green-600/20 border-green-500/40 text-green-300"
          : "bg-zinc-900/40 border-white/10 text-gray-500"
      }`}
    >
      {ok ? "🏆 " : "🔒 "} {text}
    </div>
  );
}
