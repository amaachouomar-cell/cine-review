import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function Quiz() {
  const { t, lang } = useLang();

  // ✅ Questions (AR + EN) - Light and original
  const questions = useMemo(
    () => [
      {
        id: 1,
        q: {
          ar: "أي نوع من الأفلام تفضل أكثر؟",
          en: "Which movie genre do you enjoy the most?",
        },
        options: [
          { ar: "أكشن 🔥", en: "Action 🔥", score: 2 },
          { ar: "دراما 🎭", en: "Drama 🎭", score: 2 },
          { ar: "كوميديا 😂", en: "Comedy 😂", score: 2 },
          { ar: "خيال علمي 🚀", en: "Sci-Fi 🚀", score: 2 },
        ],
      },
      {
        id: 2,
        q: {
          ar: "لو كنت داخل فيلم… ماذا ستفعل؟",
          en: "If you were inside a movie… what would you do?",
        },
        options: [
          { ar: "أقاتل وأبقى حي 💪", en: "Fight and survive 💪", score: 3 },
          { ar: "أحل لغز غامض 🧩", en: "Solve a mystery 🧩", score: 3 },
          { ar: "أصبح بطل القصة ⭐", en: "Become the main hero ⭐", score: 3 },
          { ar: "أضحك الجميع 😂", en: "Make everyone laugh 😂", score: 3 },
        ],
      },
      {
        id: 3,
        q: {
          ar: "ما الذي يجعل الفيلم ممتازاً بالنسبة لك؟",
          en: "What makes a movie truly great for you?",
        },
        options: [
          { ar: "قصة قوية 📖", en: "Strong story 📖", score: 3 },
          { ar: "تمثيل رهيب 🎬", en: "Amazing acting 🎬", score: 3 },
          { ar: "إخراج ولقطات ✨", en: "Direction & visuals ✨", score: 3 },
          { ar: "موسيقى مؤثرة 🎵", en: "Powerful soundtrack 🎵", score: 3 },
        ],
      },
      {
        id: 4,
        q: {
          ar: "اختر شخصية ستكونها في فيلم:",
          en: "Pick the role you’d play in a movie:",
        },
        options: [
          { ar: "المحقق 🕵️", en: "Detective 🕵️", score: 4 },
          { ar: "المحارب ⚔️", en: "Warrior ⚔️", score: 4 },
          { ar: "المخترع 🧠", en: "Inventor 🧠", score: 4 },
          { ar: "العبقري الكوميدي 😄", en: "Comedy genius 😄", score: 4 },
        ],
      },
      {
        id: 5,
        q: {
          ar: "كيف تحب نهاية الفيلم؟",
          en: "How do you like a movie ending?",
        },
        options: [
          { ar: "سعيدة 🌈", en: "Happy 🌈", score: 2 },
          { ar: "مؤثرة 💔", en: "Emotional 💔", score: 2 },
          { ar: "مفتوحة للتفسير 🤯", en: "Open-ended 🤯", score: 3 },
          { ar: "صادمة 😱", en: "Shocking 😱", score: 3 },
        ],
      },
      {
        id: 6,
        q: {
          ar: "لو عندك ليلة فيلم… تختار:",
          en: "Movie night… you choose:",
        },
        options: [
          { ar: "فيلم قصير وخفيف 🍿", en: "Light & short 🍿", score: 2 },
          { ar: "ملحمة طويلة 🎞️", en: "Long epic 🎞️", score: 3 },
          { ar: "فيلم رعب 😈", en: "Horror 😈", score: 3 },
          { ar: "فيلم تحفيزي ✨", en: "Inspirational ✨", score: 3 },
        ],
      },
    ],
    []
  );

  const totalQuestions = questions.length;
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const current = questions[step];

  const progress = Math.round(((step + 1) / totalQuestions) * 100);

  function handleAnswer(opt) {
    setAnswers((prev) => [...prev, opt]);
    setScore((prev) => prev + (opt.score || 0));

    if (step + 1 >= totalQuestions) {
      setFinished(true);
    } else {
      setStep((prev) => prev + 1);
    }
  }

  function restart() {
    setStep(0);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  }

  const result = useMemo(() => {
    if (!finished) return null;

    if (score <= 13) {
      return {
        title: lang === "ar" ? "🎬 مشاهد هادئ" : "🎬 Calm Viewer",
        desc:
          lang === "ar"
            ? "أنت تحب الأفلام الخفيفة والممتعة، وتفضل الاسترخاء على التوتر."
            : "You enjoy light and fun movies, and you prefer relaxing stories over stress.",
      };
    }
    if (score <= 18) {
      return {
        title: lang === "ar" ? "⭐ عاشق السينما" : "⭐ Movie Lover",
        desc:
          lang === "ar"
            ? "أنت تعرف قيمة القصة والتمثيل، وتستمتع بكل الأنواع تقريباً."
            : "You appreciate story and acting, and you enjoy many genres.",
      };
    }
    return {
      title: lang === "ar" ? "🔥 ناقد سينمائي" : "🔥 Cinema Critic",
      desc:
        lang === "ar"
          ? "أنت تحلل كل مشهد وتنتبه للتفاصيل. أنت شخص ذوقه سينمائي عالي!"
          : "You analyze every scene and love details. Your cinema taste is premium!",
    };
  }, [finished, score, lang]);

  const shareText =
    lang === "ar"
      ? `نتيجتي في CineReview Quiz هي: ${result?.title} ✅ جربها أنت أيضًا!`
      : `My result in CineReview Quiz is: ${result?.title} ✅ Try it too!`;

  useEffect(() => {
    document.title =
      lang === "ar"
        ? "لعبة اختبار الأفلام — CineReview"
        : "Movie Quiz Challenge — CineReview";
  }, [lang]);

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-4xl mx-auto pt-10">
        {/* ✅ SEO Heading */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {lang === "ar" ? "🎮 اختبار سينمائي ممتع" : "🎮 Movie Quiz Challenge"}{" "}
          <span className="text-red-500">CineReview</span>
        </h1>

        <p className="text-gray-300 mt-4 leading-relaxed">
          {lang === "ar"
            ? "اختبار خفيف وسريع لكنه ممتع جدًا. أجب عن الأسئلة واكتشف نوعك السينمائي الحقيقي! هذا المحتوى أصلي ومصمم لتجربة ممتعة داخل الموقع."
            : "A light, fast, and super fun quiz. Answer the questions and discover your true movie personality! This is original content designed to keep your experience engaging."}
        </p>

        {/* ✅ Progress */}
        {!finished && (
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>
                {lang === "ar"
                  ? `سؤال ${step + 1} من ${totalQuestions}`
                  : `Question ${step + 1} of ${totalQuestions}`}
              </span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-red-600"
              />
            </div>
          </div>
        )}

        {/* ✅ Quiz Card */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={current?.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 shadow-xl"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-6">
                  {current?.q?.[lang]}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {current?.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="text-left px-5 py-4 rounded-2xl border border-white/10 bg-black/30 hover:bg-zinc-800 hover:border-white/20 transition font-semibold"
                    >
                      {opt?.[lang]}
                    </button>
                  ))}
                </div>

                {/* ✅ Tip */}
                <p className="text-gray-500 text-xs mt-6">
                  {lang === "ar"
                    ? "💡 نصيحة: لا تفكر كثيرًا… اختر أول إحساس!"
                    : "💡 Tip: Don’t overthink… choose your first instinct!"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 shadow-xl"
              >
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  {result?.title}
                </h2>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  {result?.desc}
                </p>

                <div className="mt-6 flex flex-col md:flex-row gap-3">
                  <button
                    onClick={restart}
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
                  >
                    {lang === "ar" ? "🔁 أعد المحاولة" : "🔁 Restart"}
                  </button>

                  <button
                    onClick={() => navigator.clipboard.writeText(shareText)}
                    className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-semibold"
                  >
                    {lang === "ar"
                      ? "📋 انسخ نتيجتك"
                      : "📋 Copy your result"}
                  </button>
                </div>

                {/* ✅ Extra Original Content (SEO / Adsense) */}
                <div className="mt-10 space-y-4 text-gray-300 leading-relaxed text-sm">
                  <h3 className="text-white font-bold text-lg">
                    {lang === "ar"
                      ? "لماذا هذه اللعبة موجودة؟"
                      : "Why does this quiz exist?"}
                  </h3>
                  <p>
                    {lang === "ar"
                      ? "لأن السينما ليست فقط مشاهدة… بل تجربة. هذا الاختبار يساعدك على اكتشاف شخصيتك السينمائية، ويمنحك فكرة عن نوع الأفلام التي ستستمتع بها أكثر."
                      : "Because cinema is not just watching — it’s a feeling. This quiz helps you discover your movie personality and guides you toward the types of films you’ll enjoy most."}
                  </p>

                  <h3 className="text-white font-bold text-lg">
                    {lang === "ar" ? "أسئلة شائعة" : "FAQ"}
                  </h3>

                  <p>
                    <b className="text-white">
                      {lang === "ar"
                        ? "هل هذا الاختبار دقيق؟"
                        : "Is this quiz accurate?"}
                    </b>{" "}
                    {lang === "ar"
                      ? "هو اختبار ترفيهي ذكي يعتمد على أسلوب تفضيلاتك، وليس اختبار علمي."
                      : "It’s a smart entertainment quiz based on your preferences, not a scientific test."}
                  </p>

                  <p>
                    <b className="text-white">
                      {lang === "ar"
                        ? "هل يتم حفظ بياناتي؟"
                        : "Do you store my data?"}
                    </b>{" "}
                    {lang === "ar"
                      ? "لا، كل شيء يتم داخل جهازك فقط."
                      : "No, everything happens locally on your device."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
