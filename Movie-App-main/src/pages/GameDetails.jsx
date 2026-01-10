import { useParams, NavLink } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import { motion } from "framer-motion";

export default function GameDetails() {
  const { slug } = useParams();
  const { lang } = useLang();

  const data = {
    quiz: {
      title: lang === "ar" ? "اختبار الأفلام" : "Movie Quiz",
      desc:
        lang === "ar"
          ? "اختبر ثقافتك السينمائية عبر أسئلة ممتعة!"
          : "Test your movie knowledge with fun questions!",
      play: "/quiz",
    },
    "guess-movie": {
      title: lang === "ar" ? "خمن الفيلم" : "Guess The Movie",
      desc:
        lang === "ar"
          ? "شاهد بوستر الفيلم وخمن الاسم قبل انتهاء الوقت!"
          : "Watch the movie poster and guess its title before time runs out!",
      play: "/guess-movie",
    },
    "cine-match": {
      title: lang === "ar" ? "CineMatch (لعبة الذاكرة)" : "CineMatch (Memory Game)",
      desc:
        lang === "ar"
          ? "لعبة ذاكرة احترافية بمستويات متدرجة وبطاقات سينمائية!"
          : "A premium memory game with levels and cinematic cards!",
      play: "/cine-match",
    },
  };

  const game = data[slug];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-xl">
          {lang === "ar" ? "❌ اللعبة غير موجودة" : "❌ Game not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 text-white">
      <div className="max-w-4xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[2.5rem] bg-zinc-900/40 border border-white/10 p-7 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold">{game.title}</h1>
          <p className="text-gray-300 mt-4">{game.desc}</p>

          <div className="flex flex-wrap gap-3 mt-8">
            <NavLink
              to="/games"
              className="px-6 py-3 rounded-2xl bg-zinc-800/60 border border-white/10 hover:bg-zinc-700 transition font-bold"
            >
              {lang === "ar" ? "⬅ العودة للألعاب" : "⬅ Back to Games"}
            </NavLink>

            <NavLink
              to={game.play}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-lg"
            >
              {lang === "ar" ? "🚀 ابدأ اللعب الآن" : "🚀 Play Now"}
            </NavLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
