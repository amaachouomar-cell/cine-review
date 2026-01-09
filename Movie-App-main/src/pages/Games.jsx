import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const gamesList = [
  {
    slug: "guess-movie",
    titleEn: "Guess The Movie",
    titleAr: "خمن الفيلم",
    descEn: "Look at the poster and choose the correct movie title before time runs out!",
    descAr: "شاهد بوستر الفيلم واختر الاسم الصحيح قبل انتهاء الوقت!",
    levelEn: "Medium",
    levelAr: "متوسط",
    badge: "🎬",
    color: "bg-red-600",
  },
  {
  slug: "cinerunner",
  titleEn: "CineRunner (Mario-like)",
  titleAr: "لعبة CineRunner",
  descEn: "A real Mario-style platformer inside CineReview.",
  descAr: "لعبة منصات مثل ماريو داخل CineReview.",
  levelEn: "Hard",
  levelAr: "صعب",
  badge: "🏃",
  color: "bg-blue-600",
},

  {
    slug: "movie-quiz",
    titleEn: "Movie Quiz",
    titleAr: "اختبار الأفلام",
    descEn: "Answer fun movie questions and test your cinema knowledge!",
    descAr: "أجب عن أسئلة ممتعة واختبر معلوماتك السينمائية!",
    levelEn: "Easy",
    levelAr: "سهل",
    badge: "🧠",
    color: "bg-indigo-600",
  },
  {
  slug: "cinequest",
  titleEn: "CineQuest (Adventure Game)",
  titleAr: "مغامرة CineQuest",
  descEn: "A real 2D adventure game: choose your hero, collect tickets, beat obstacles, and finish levels!",
  descAr: "لعبة مغامرات ثنائية الأبعاد: اختر بطلك، اجمع التذاكر، تجاوز العوائق وأكمل المراحل!",
  levelEn: "Hard",
  levelAr: "صعب",
  badge: "🕹️",
  color: "bg-emerald-600",
},

];

export default function Games() {
  const { lang, t } = useLang();

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-6xl mx-auto pt-12">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          🎮 {t?.gamesHub || (lang === "ar" ? "قسم الألعاب" : "Games Hub")}
        </motion.h1>

        <p className="text-gray-400 mt-4 max-w-3xl">
          {t?.gamesHubDesc ||
            (lang === "ar"
              ? "اختر لعبة ممتعة مرتبطة بعالم الأفلام. ألعاب خفيفة، ممتعة، واحترافية."
              : "Pick a fun cinema-related game. Lightweight, engaging, and professional.")}
        </p>

        {/* ✅ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {gamesList.map((g) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${g.color}`}>
                    {g.badge}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {lang === "ar" ? g.titleAr : g.titleEn}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {lang === "ar" ? g.levelAr : g.levelEn}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-black/40 border border-white/10 text-gray-300">
                  {lang === "ar" ? "لعبة سينمائية" : "Cinema Game"}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">
                {lang === "ar" ? g.descAr : g.descEn}
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-2">
                <NavLink
                  to={`/games/${g.slug}`}
                  className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg text-sm"
                >
                  {t?.details || (lang === "ar" ? "تفاصيل" : "Details")}
                </NavLink>

                <NavLink
                to={
  g.slug === "guess-movie"
    ? "/game"
    : g.slug === "movie-quiz"
    ? "/quiz"
    : "/cinequest"
}
                  
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition font-semibold border border-white/10 text-sm"
                >
                  {t?.start || (lang === "ar" ? "ابدأ الآن" : "Start")}
              
                </NavLink>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
