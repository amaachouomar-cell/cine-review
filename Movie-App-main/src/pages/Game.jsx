import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

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

function winConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 } });
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

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [time, setTime] = useState(DIFFICULTIES[difficulty].time);
  const timerRef = useRef(null);

  const [imgReady, setImgReady] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(false);

  const [loadingQ, setLoadingQ] = useState(false);

  // ✅ limited helps
  const [hintCount, setHintCount] = useState(3);
  const [removeTwoCount, setRemoveTwoCount] = useState(3);

  const [hintInfo, setHintInfo] = useState(null);
  const [removedOptions, setRemovedOptions] = useState([]);

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
        .slice(0, 10);

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
    setSelected(null);
    setLocked(false);

    setHintCount(3);
    setRemoveTwoCount(3);

    setHintInfo(null);
    setRemovedOptions([]);

    await fetchQuestions(selectedGenre.id);
  }

  // ✅ Prepare question options + preload image
  useEffect(() => {
    if (!currentQ) return;

    clearInterval(timerRef.current);

    setLocked(false);
    setSelected(null);

    setImgReady(false);
    setReadyToPlay(false);
    setHintInfo(null);
    setRemovedOptions([]);

    setTime(DIFFICULTIES[difficulty].time);

    const correct = currentQ.title;
    const wrong = shuffle(
      questions.filter((q) => q.id !== currentQ.id).map((q) => q.title)
    ).slice(0, 3);

    setOptions(shuffle([correct, ...wrong]));

    // ✅ Preload image
    const img = new Image();
    img.src = TMDB_IMG + currentQ.backdrop_path;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true);
  }, [current, currentQ, difficulty]);

  function startRound() {
    if (!imgReady) return;

    setReadyToPlay(true);

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

  function timeout() {
    if (locked) return;
    setLocked(true);
    setStreak(0);
    setTimeout(nextQuestion, 900);
  }

  function handleAnswer(opt) {
    if (locked) return;

    setLocked(true);
    setSelected(opt);

    const correct = opt === currentQ.title;

    if (correct) {
      winConfetti();
      setScore((s) => s + DIFFICULTIES[difficulty].points + streak * 2);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }

    setTimeout(nextQuestion, 900);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      setStep("end");
      clearInterval(timerRef.current);
      return;
    }
    setCurrent((c) => c + 1);
  }

  // ✅ Hint → only year + rating
  function useHint() {
    if (hintCount <= 0 || locked || !readyToPlay) return;
    setHintCount((c) => c - 1);

    const year = currentQ.release_date ? currentQ.release_date.split("-")[0] : "N/A";
    const rating = currentQ.vote_average ? currentQ.vote_average.toFixed(1) : "N/A";

    setHintInfo({ year, rating });
  }

  // ✅ Remove Two Options limited
  function useRemoveTwo() {
    if (removeTwoCount <= 0 || locked || !readyToPlay) return;
    setRemoveTwoCount((c) => c - 1);

    const wrongs = options.filter((o) => o !== currentQ.title);
    setRemovedOptions(shuffle(wrongs).slice(0, 2));
  }

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold">
          🎬 {lang === "ar" ? "خمن الفيلم" : "Guess The Movie"}
        </h1>

        <p className="text-gray-400 mt-2">
          {lang === "ar"
            ? "الصورة تُحمّل أولاً ثم تبدأ الجولة — تجربة سلسة واحترافية."
            : "Image loads first, then the round starts — smooth & professional."}
        </p>

        {/* PICK */}
        {step === "pick" && (
          <div className="mt-10 space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4">
                {lang === "ar" ? "اختر الصعوبة" : "Choose Difficulty"}
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {Object.keys(DIFFICULTIES).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-4 rounded-2xl border font-bold transition shadow-lg ${
                      difficulty === d
                        ? "bg-red-600 border-red-500"
                        : "bg-zinc-900/40 border-white/10 hover:bg-zinc-800"
                    }`}
                  >
                    {DIFFICULTIES[d].emoji}{" "}
                    {lang === "ar" ? DIFFICULTIES[d].labelAr : DIFFICULTIES[d].labelEn}
                  </button>
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
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(g)}
                    className="px-4 py-6 rounded-3xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-800 shadow-xl text-center"
                  >
                    <div className="text-3xl">{g.emoji}</div>
                    <div className="font-bold mt-2">{lang === "ar" ? g.ar : g.en}</div>
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
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>
                {lang === "ar" ? "سؤال" : "Question"} {current + 1}/{questions.length}
              </span>
              <span>⭐ {score} | 🔥 {streak}</span>
            </div>

            {/* IMAGE */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 shadow-xl relative">
              {!imgReady && (
                <div className="h-[240px] md:h-[360px] flex items-center justify-center text-gray-400 animate-pulse">
                  {lang === "ar" ? "📸 تحميل الصورة..." : "📸 Loading image..."}
                </div>
              )}

              {imgReady && (
                <motion.img
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  src={TMDB_IMG + currentQ.backdrop_path}
                  alt="movie"
                  className="w-full h-[240px] md:h-[360px] object-cover"
                />
              )}

              {/* TIMER */}
              {readyToPlay && (
                <div className="absolute top-4 right-4 bg-black/60 px-4 py-2 rounded-2xl font-bold border border-white/10">
                  ⏱ {time}s
                </div>
              )}

              {/* READY BUTTON */}
              {imgReady && !readyToPlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <button
                    onClick={startRound}
                    className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl"
                  >
                    {lang === "ar" ? "التالي ➜" : "Next ➜"}
                  </button>
                </div>
              )}
            </div>

            {/* HINT BOX */}
            {hintInfo && (
              <div className="px-4 py-4 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-200">
                🎯 {lang === "ar" ? "تلميح:" : "Hint:"}{" "}
                {lang === "ar"
                  ? `سنة الإصدار: ${hintInfo.year} | التقييم: ${hintInfo.rating}⭐`
                  : `Release Year: ${hintInfo.year} | Rating: ${hintInfo.rating}⭐`}
              </div>
            )}

            {/* POWERUPS */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={useHint}
                disabled={hintCount <= 0 || locked || !readyToPlay}
                className="px-3 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 hover:bg-zinc-800 transition font-bold"
              >
                🧠 {lang === "ar" ? "تلميح" : "Hint"} ({hintCount})
              </button>

              <button
                onClick={useRemoveTwo}
                disabled={removeTwoCount <= 0 || locked || !readyToPlay}
                className="px-3 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 hover:bg-zinc-800 transition font-bold"
              >
                ❌ {lang === "ar" ? "حذف خيارين" : "Remove 2"} ({removeTwoCount})
              </button>
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt) => {
                if (removedOptions.includes(opt)) return null;

                const correct = opt === currentQ.title;
                const isChosen = opt === selected;

                let style = "bg-zinc-900/40 border-white/10 hover:bg-zinc-800";

                if (locked) {
                  if (correct) style = "bg-green-600/80 border-green-400";
                  else if (isChosen) style = "bg-red-600/80 border-red-400";
                  else style = "bg-zinc-900/30 border-white/10 text-gray-500";
                }

                return (
                  <motion.button
                    key={opt}
                    whileHover={!locked ? { scale: 1.02 } : {}}
                    whileTap={!locked ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={locked || !readyToPlay}
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
            <h2 className="text-4xl font-extrabold">
              🏆 {lang === "ar" ? "انتهت اللعبة!" : "Game Finished!"}
            </h2>

            <p className="text-gray-300 text-lg">
              {lang === "ar" ? "نتيجتك:" : "Your Score:"}{" "}
              <b className="text-red-400">{score}</b>
            </p>

            <button
              onClick={() => setStep("pick")}
              className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-xl"
            >
              {lang === "ar" ? "🔁 العب مجددًا" : "🔁 Play Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
