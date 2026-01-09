import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const TMDB = "https://api.themoviedb.org/3";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Game() {
  const { lang, t } = useLang();

  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const posterUrl = useMemo(() => {
    if (!current?.poster_path) return null;
    return `https://image.tmdb.org/t/p/w500${current.poster_path}`;
  }, [current]);

  // ✅ Fetch trending movies once
  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const res = await fetch(
          `${TMDB}/trending/movie/week?api_key=${apiKey}&language=${
            lang === "ar" ? "ar" : "en-US"
          }`
        );
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("TMDB error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [apiKey, lang]);

  // ✅ Start first question
  useEffect(() => {
    if (movies.length > 0) {
      nextQuestion();
    }
  }, [movies]);

  // ✅ Timer
  useEffect(() => {
    if (!current) return;
    if (feedback) return; // pause when showing feedback

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, feedback]);

  function handleTimeout() {
    setFeedback({
      type: "timeout",
      message:
        lang === "ar"
          ? "⏳ انتهى الوقت! حاول مرة أخرى."
          : "⏳ Time’s up! Try again.",
    });

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  }

  function nextQuestion() {
    setSelected(null);
    setFeedback(null);
    setTimeLeft(Math.max(10, 16 - level)); // ✅ dynamic timer with level
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];

    // ✅ pick 3 wrong answers
    const wrong = shuffle(
      movies.filter((m) => m.id !== randomMovie.id).slice(0, 15)
    )
      .slice(0, 3)
      .map((m) => m.title);

    const allOptions = shuffle([randomMovie.title, ...wrong]);

    setCurrent(randomMovie);
    setOptions(allOptions);
  }

  function handlePick(option) {
    if (selected) return; // prevent double click
    setSelected(option);

    const correct = option === current.title;

    if (correct) {
      setScore((s) => s + 10);
      setLevel((l) => l + 1);
      setFeedback({
        type: "success",
        message: lang === "ar" ? "✅ صحيح! رائع 🔥" : "✅ Correct! Great job 🔥",
      });
    } else {
      setFeedback({
        type: "fail",
        message:
          lang === "ar"
            ? `❌ خطأ! الجواب الصحيح هو: ${current.title}`
            : `❌ Wrong! Correct answer: ${current.title}`,
      });
    }

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  }

  function resetGame() {
    setScore(0);
    setLevel(1);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(15);
    if (movies.length > 0) nextQuestion();
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-10">
        {/* ✅ Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              🎮 {lang === "ar" ? "لعبة تخمين الفيلم" : "Guess The Movie"}
            </h1>
            <p className="text-gray-400 mt-3">
              {lang === "ar"
                ? "شاهد البوستر واختر الاسم الصحيح خلال الوقت!"
                : "Look at the poster and pick the correct title before time runs out!"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/50 border border-white/10">
              <p className="text-xs text-gray-400">
                {lang === "ar" ? "النقاط" : "Score"}
              </p>
              <p className="text-xl font-bold">{score}</p>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-zinc-900/50 border border-white/10">
              <p className="text-xs text-gray-400">
                {lang === "ar" ? "المرحلة" : "Level"}
              </p>
              <p className="text-xl font-bold">{level}</p>
            </div>

            <button
              onClick={resetGame}
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
            >
              {lang === "ar" ? "إعادة" : "Reset"}
            </button>
          </div>
        </div>

        {/* ✅ Card */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          {loading || !current ? (
            <p className="text-gray-400">
              {lang === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* ✅ Poster */}
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={current.title}
                    className="w-full h-[420px] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[420px] flex items-center justify-center text-gray-400">
                    {t?.noPoster || "No Poster"}
                  </div>
                )}
              </div>

              {/* ✅ Options */}
              <div>
                {/* ✅ Timer */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-gray-400">
                    {lang === "ar" ? "⏱️ الوقت" : "⏱️ Time"}:
                    <span className="text-white font-bold ml-2">{timeLeft}s</span>
                  </p>

                  <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 15) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {lang === "ar"
                    ? "شنو هو اسم الفيلم؟"
                    : "Which movie is this?"}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {options.map((op) => {
                    const isSelected = selected === op;
                    const isCorrect = current.title === op;

                    return (
                      <button
                        key={op}
                        onClick={() => handlePick(op)}
                        className={`px-5 py-4 rounded-2xl text-left font-semibold transition border
                          ${
                            !selected
                              ? "bg-zinc-950/40 border-white/10 hover:bg-zinc-800 hover:text-white"
                              : isCorrect
                              ? "bg-green-600/80 border-green-400 text-white"
                              : isSelected
                              ? "bg-red-600/80 border-red-400 text-white"
                              : "bg-zinc-950/30 border-white/10 text-gray-400"
                          }
                        `}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>

                {/* ✅ Feedback */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-5 p-4 rounded-2xl border text-sm font-semibold ${
                      feedback.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-200"
                        : feedback.type === "fail"
                        ? "bg-red-500/10 border-red-500/20 text-red-200"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-200"
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Footer note */}
        <p className="text-gray-500 text-xs mt-6">
          {t?.tmdbNote ||
            "This product uses the TMDB API but is not endorsed or certified by TMDB."}
        </p>
      </div>
    </div>
  );
}
