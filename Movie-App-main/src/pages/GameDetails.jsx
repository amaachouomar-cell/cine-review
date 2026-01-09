import { useParams, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const gamesList = {
  "guess-movie": {
    titleEn: "Guess The Movie",
    titleAr: "خمن الفيلم",
    descEn:
      "A fun game where you guess the movie title from the poster. You get 4 options and a timer!",
    descAr:
      "لعبة ممتعة تخمّن فيها اسم الفيلم من خلال البوستر. لديك 4 خيارات ووقت محدود!",
    howEn: [
      "Look at the poster.",
      "Choose the correct title from 4 options.",
      "Answer quickly before time ends.",
      "Earn points and reach higher levels.",
    ],
    howAr: [
      "شاهد البوستر.",
      "اختر الاسم الصحيح من 4 خيارات.",
      "أجب بسرعة قبل انتهاء الوقت.",
      "اجمع النقاط واربح مستويات أعلى.",
    ],
    startLink: "/game",
    badge: "🎬",
    color: "bg-red-600",
  },

  "movie-quiz": {
    titleEn: "Movie Quiz",
    titleAr: "اختبار الأفلام",
    descEn:
      "Test your cinema knowledge with a fun quiz. Quick, simple, and enjoyable!",
    descAr:
      "اختبر معلوماتك السينمائية عبر اختبار ممتع وسريع!",
    howEn: [
      "Read the question carefully.",
      "Pick the correct answer.",
      "Score points and improve your rank.",
    ],
    howAr: [
      "اقرأ السؤال جيدًا.",
      "اختر الجواب الصحيح.",
      "اجمع النقاط وارفع مستواك.",
    ],
    startLink: "/quiz",
    badge: "🧠",
    color: "bg-indigo-600",
  },
  "cinequest": {
  titleEn: "CineQuest (Adventure Game)",
  titleAr: "مغامرة CineQuest",
  descEn:
    "A real 2D adventure game inside CineReview. Choose your hero, collect movie tickets, dodge obstacles, and progress through levels.",
  descAr:
    "لعبة مغامرات ثنائية الأبعاد داخل CineReview. اختر شخصيتك، اجمع تذاكر السينما، تفادى العوائق و انتقل عبر مراحل كثيرة.",
  howEn: [
    "Pick your hero before starting.",
    "Move using arrows (or touch on mobile).",
    "Jump to avoid obstacles and enemies.",
    "Collect 🎟️ tickets to unlock the next level.",
    "Finish levels to earn bonus rewards.",
  ],
  howAr: [
    "اختر شخصيتك قبل البداية.",
    "تحرك باستخدام الأسهم (أو أزرار الهاتف).",
    "اقفز لتفادي العوائق والأعداء.",
    "اجمع 🎟️ التذاكر لفتح المرحلة التالية.",
    "أكمل المراحل للحصول على مكافآت.",
  ],
  startLink: "/cinequest",
  badge: "🕹️",
  color: "bg-emerald-600",
},

};

export default function GameDetails() {
  const { slug } = useParams();
  const { lang, t } = useLang();

  const game = gamesList[slug];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Game not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-4xl mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${game.color}`}>
              {game.badge}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {lang === "ar" ? game.titleAr : game.titleEn}
              </h1>
              <p className="text-gray-400 mt-1">
                {lang === "ar" ? game.descAr : game.descEn}
              </p>
            </div>
          </div>

          {/* How to play */}
          <h2 className="text-xl font-bold mb-3">
            {t?.howToPlay || (lang === "ar" ? "كيف تلعب؟" : "How to play")}
          </h2>

          <ul className="list-disc list-inside text-gray-300 space-y-2 leading-relaxed">
            {(lang === "ar" ? game.howAr : game.howEn).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <NavLink
              to="/games"
              className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition font-semibold border border-white/10 text-center"
            >
              {t?.back || (lang === "ar" ? "رجوع للألعاب" : "Back to Games")}
            </NavLink>

            <NavLink
              to={game.startLink}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg text-center"
            >
              {t?.start || (lang === "ar" ? "ابدأ اللعبة" : "Start Game")}
            </NavLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
