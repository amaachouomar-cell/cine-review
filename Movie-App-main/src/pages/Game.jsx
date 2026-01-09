import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLang } from "../i18n/LanguageContext";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";

const GENRES = [
  { id: 28, ar: "أكشن", en: "Action", emoji: "💥" },
  { id: 35, ar: "كوميديا", en: "Comedy", emoji: "😂" },
  { id: 18, ar: "دراما", en: "Drama", emoji: "🎭" },
  { id: 27, ar: "رعب", en: "Horror", emoji: "👻" },
  { id: 9648, ar: "غموض", en: "Mystery", emoji: "🕵️‍♂️" },
  { id: 10749, ar: "رومانسي", en: "Romance", emoji: "❤️" },
  { id: 16, ar: "أنيميشن", en: "Animation", emoji: "🎨" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function burst() {
  confetti({
    particleCount: 120,
    spread: 85,
    origin: { y: 0.7 },
  });
}

export default function Quiz() {
  const { lang } = useLang();

  const [step, setStep] = useState("pick"); // pick | play | end
  const [genre, setGenre] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const currentQ = questions[current];

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [roundStarted, setRoundStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [time, setTime] = useState(20);
  const timerRef = useRef(null);

  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null); // correct | wrong | timeout

  const [hintCount, setHintCount] = useState(3);
  const [removeTwoCount, setRemoveTwoCount] = useState(3);
  const [removedOptions, setRemovedOptions] = useState([]);
  const [hintInfo, setHintInfo] = useState(null);

  const [imgReady, setImgReady] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1200);
  }

  async function fetchQuestions(genreId) {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
    );
    const data = await res.json();

    const picked = shuffle(data.results)
      .filter((m) => m.backdrop_path)
      .slice(0, 12);

    setQuestions(picked);
  }

  async function startQuiz(g) {
    setGenre(g);
    setStep("play");
    setScore(0);
    setCurrent(0);

    setHintCount(3);
    setRemoveTwoCount(3);

    await fetchQuestions(g.id);
  }

  // Prepare Question
  useEffect(() => {
    if (!currentQ) return;

    clearInterval(timerRef.current);

    setRoundStarted(false);
    setLocked(false);
    setSelected(null);
    setResult(null);

    setHintInfo(null);
    setRemovedOptions([]);
    setTime(20);

    setImgReady(false);

    const correct = currentQ.title;
    const wrong = shuffle(
      questions.filter((q) => q.id !== currentQ.id).map((q) => q.title)
    ).slice(0, 3);

    setOptions(shuffle([correct, ...wrong]));

    // preload image
    const img = new Image();
    img.src = TMDB_IMG + currentQ.backdrop_path;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true);
  }, [current, currentQ, questions]);

  function timeout() {
    if (locked) return;
    setLocked(true);
    setResult("timeout");
    setSelected(null);
    showToast(lang === "ar" ? "⏳ انتهى الوقت!" : "⏳ Time is up!");
  }

  function handleStartOrNext() {
    if (!roundStarted) {
      if (!imgReady) return;

      setRoundStarted(true);

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

      return;
    }

    if (locked) {
      if (current + 1 >= questions.length) {
        setStep("end");
      } else {
        setCurrent((c) => c + 1);
      }
    }
  }

  function handleAnswer(opt) {
    if (!roundStarted || locked) return;

    clearInterval(timerRef.current);
    setLocked(true);
    setSelected(opt);

    const correct = opt === currentQ.title;
    setResult(correct ? "correct" : "wrong");

    if (correct) {
      burst();
      setScore((s) => s + 10 + time);
      showToast(lang === "ar" ? "✅ صحيح!" : "✅ Correct!");
    } else {
      showToast(lang === "ar" ? "❌ خطأ!" : "❌ Wrong!");
    }
  }

  function handleHint() {
    if (!roundStarted) return;
    if (hintCount <= 0) return showToast(lang === "ar" ? "انتهت التلميحات!" : "No hints left!");

    setHintCount((c) => c - 1);
    setHintInfo({
      year: currentQ.release_date?.slice(0, 4),
      rating: currentQ.vote_average?.toFixed(1),
    });
  }

  function handleRemoveTwo() {
    if (!roundStarted) return;
    if (removeTwoCount <= 0) return showToast(lang === "ar" ? "انتهت المساعدة!" : "No helps left!");

    setRemoveTwoCount((c) => c - 1);

    const wrong = options.filter((o) => o !== currentQ.title);
    const toRemove = shuffle(wrong).slice(0, 2);
    setRemovedOptions(toRemove);
  }

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white">
      <div className="max-w-5xl mx-auto pt-12">

        {/* ✅ Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl text-sm font-semibold shadow-xl z-50"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Pick Genre */}
        {step === "pick" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              🎬 {lang === "ar" ? "خمن الفيلم" : "Guess The Movie"}
            </h1>
            <p className="text-gray-400 mt-4 text-base md:text-lg">
              {lang === "ar"
                ? "اختر فئة لتبدأ لعبة ممتعة وسريعة."
                : "Pick a genre to start a fast premium quiz."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {GENRES.map((g) => (
                <motion.button
                  key={g.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startQuiz(g)}
                  className="relative p-5 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 group-hover:from-red-600/15 group-hover:via-red-600/5 group-hover:to-red-600/15 transition" />
                  <div className="relative flex flex-col items-center gap-2">
                    <span className="text-3xl">{g.emoji}</span>
                    <span className="font-bold">
                      {lang === "ar" ? g.ar : g.en}
                    </span>
                    <span className="text-xs text-gray-400">
                      {lang === "ar" ? "ابدأ" : "Start"}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ✅ GAME */}
        {step === "play" && currentQ && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* ✅ Title + Score */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold">
                {lang === "ar" ? "🎮 الجولة" : "🎮 Round"}{" "}
                <span className="text-red-500">{current + 1}</span>
              </h2>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-sm font-semibold">
                  {lang === "ar" ? "النقاط" : "Score"}:{" "}
                  <span className="text-red-400">{score}</span>
                </div>

                {roundStarted && (
                  <div className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-sm font-semibold">
                    ⏱ {time}s
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Image */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/40 overflow-hidden shadow-xl">
              <div className="relative">
                {!imgReady && (
                  <div className="h-56 md:h-[380px] flex items-center justify-center text-gray-400">
                    {lang === "ar" ? "تحميل الصورة..." : "Loading image..."}
                  </div>
                )}

                {imgReady && (
                  <img
                    src={TMDB_IMG + currentQ.backdrop_path}
                    alt="movie"
                    className="w-full h-56 md:h-[380px] object-cover"
                  />
                )}

                {/* ✅ Dark overlay until started */}
                {!roundStarted && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <p className="text-lg font-semibold text-gray-200">
                      {lang === "ar"
                        ? "اضغط (ابدأ الجولة) للكشف"
                        : "Press (Start Round) to reveal"}
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ Small Result Box Under Image */}
              <div className="p-4 flex flex-col gap-3">
                {hintInfo && (
                  <div className="px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-sm text-gray-200">
                    💡 {lang === "ar" ? "تلميح:" : "Hint:"}{" "}
                    {lang === "ar" ? "سنة الإصدار" : "Year"}:{" "}
                    <b>{hintInfo.year}</b> —{" "}
                    {lang === "ar" ? "التقييم" : "Rating"}:{" "}
                    <b>{hintInfo.rating}</b>
                  </div>
                )}

                {locked && (
                  <div
                    className={`px-4 py-3 rounded-2xl border text-sm font-semibold ${
                      result === "correct"
                        ? "bg-green-600/15 border-green-500/30 text-green-200"
                        : "bg-red-600/15 border-red-500/30 text-red-200"
                    }`}
                  >
                    {result === "correct" &&
                      (lang === "ar" ? "✅ إجابة صحيحة!" : "✅ Correct Answer!")}
                    {result === "wrong" && (
                      <>
                        {lang === "ar" ? "❌ خطأ!" : "❌ Wrong!"}{" "}
                        <span className="text-white">
                          {lang === "ar" ? "الإجابة:" : "Answer:"}{" "}
                          <b>{currentQ.title}</b>
                        </span>
                      </>
                    )}
                    {result === "timeout" && (
                      <>
                        {lang === "ar" ? "⏳ انتهى الوقت!" : "⏳ Time’s up!"}{" "}
                        <span className="text-white">
                          {lang === "ar" ? "الإجابة:" : "Answer:"}{" "}
                          <b>{currentQ.title}</b>
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* ✅ One Button ONLY */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartOrNext}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold text-lg shadow-xl"
                >
                  {!roundStarted
                    ? lang === "ar"
                      ? "🚀 ابدأ الجولة"
                      : "🚀 Start Round"
                    : locked
                    ? lang === "ar"
                      ? "➡️ التالي"
                      : "➡️ Next"
                    : lang === "ar"
                    ? "اختر جوابًا أولاً"
                    : "Pick an answer"}
                </motion.button>
              </div>
            </div>

            {/* ✅ Helps */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRemoveTwo}
                disabled={removeTwoCount <= 0 || locked || !roundStarted}
                className="py-3 rounded-2xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold disabled:opacity-40"
              >
                ❌ {lang === "ar" ? "حذف خيارين" : "Remove 2"} ({removeTwoCount})
              </button>

              <button
                onClick={handleHint}
                disabled={hintCount <= 0 || locked || !roundStarted}
                className="py-3 rounded-2xl bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 transition font-semibold disabled:opacity-40"
              >
                💡 {lang === "ar" ? "تلميح" : "Hint"} ({hintCount})
              </button>
            </div>

            {/* ✅ Options */}
            <div className="space-y-3">
              {options.map((opt) => {
                const isCorrect = opt === currentQ.title;
                const isRemoved = removedOptions.includes(opt);

                return (
                  <button
                    key={opt}
                    disabled={locked || !roundStarted || isRemoved}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full py-5 rounded-2xl border text-lg font-bold transition shadow-md ${
                      locked && isCorrect
                        ? "bg-green-600/40 border-green-500 text-white"
                        : locked && selected === opt && !isCorrect
                        ? "bg-red-600/40 border-red-500 text-white"
                        : "bg-zinc-900/40 border-white/10 text-gray-200 hover:bg-zinc-800"
                    } ${isRemoved ? "opacity-35 line-through" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ✅ END */}
        {step === "end" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center mt-16"
          >
            <h1 className="text-4xl font-extrabold">
              🎉 {lang === "ar" ? "انتهت اللعبة!" : "Game Finished!"}
            </h1>

            <p className="text-gray-400 mt-3">
              {lang === "ar" ? "مجموع نقاطك:" : "Your total score:"}{" "}
              <span className="text-red-500 font-bold">{score}</span>
            </p>

            <button
              onClick={() => setStep("pick")}
              className="mt-8 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-xl"
            >
              🔁 {lang === "ar" ? "العب من جديد" : "Play Again"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
