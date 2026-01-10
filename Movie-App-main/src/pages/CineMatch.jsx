import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";
import { Link } from "react-router-dom";

export default function Games() {
  const { lang } = useLang();
  const isAR = lang === "ar";

  const games = [
    {
      slug: "cinequest",
      title: isAR ? "🎬 خمن الفيلم" : "🎬 Guess The Movie",
      difficulty: isAR ? "متوسط" : "Medium",
      description: isAR
        ? "شاهد بوستر الفيلم واختر الاسم الصحيح قبل انتهاء الوقت!"
        : "Watch the poster and pick the correct movie title before time runs out!",
      icon: "🎬",
    },

    {
      slug: "quiz",
      title: isAR ? "🧠 اختبار الأفلام" : "🧠 Movie Quiz",
      difficulty: isAR ? "سهل" : "Easy",
      description: isAR
        ? "أجب عن أسئلة ممتعة واختبر معلوماتك السينمائية!"
        : "Answer fun questions and test your movie knowledge!",
      icon: "🧠",
    },

    {
      slug: "cine-match",
      title: isAR ? "🎴 Cine Match" : "🎴 Cine Match",
      difficulty: isAR ? "Premium" : "Premium",
      description: isAR
        ? "لعبة مطابقة بوسترات الأفلام — افتح بطاقتين واطابق نفس الفيلم!"
        : "Movie Poster Matching — flip 2 cards and match the same movie!",
      icon: "🎴",
    },
  ];

  return (
    <div className="min-h-screen px-4 pb-20 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {isAR ? "🎮 الألعاب" : "🎮 Games"}
        </h1>
        <p className="text-gray-400 mt-3">
          {isAR
            ? "ألعاب سينمائية ممتعة داخل موقع CineReview 🎬"
            : "Premium cinematic games inside CineReview 🎬"}
        </p>

        <div className="mt-10 grid gap-6">
          {games.map((g) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl shadow-xl p-6 flex items-center justify-between gap-6 flex-wrap"
            >
              {/* ✅ Left */}
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-2xl shadow-lg">
                  {g.icon}
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold">{g.title}</h2>
                  <p className="text-gray-300 mt-1">{g.description}</p>

                  <span className="inline-block mt-3 px-4 py-1 rounded-full text-xs font-bold bg-zinc-800/60 border border-white/10 text-gray-200">
                    {g.difficulty}
                  </span>
                </div>
              </div>

              {/* ✅ Right */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/games/${g.slug}`}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-bold shadow-lg"
                >
                  {isAR ? "ابدأ الآن" : "Start Now"}
                </Link>

                <Link
                  to={`/games/${g.slug}`}
                  className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 hover:bg-zinc-800 transition font-bold"
                >
                  {isAR ? "تفاصيل" : "Details"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
