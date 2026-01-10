import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";

export default function Games() {
  const { lang } = useLang();

  const games = [
    {
      slug: "quiz",
      title: lang === "ar" ? "اختبار الأفلام" : "Movie Quiz",
      desc:
        lang === "ar"
          ? "اختبر ثقافتك السينمائية وتحدى وقتك!"
          : "Test your movie knowledge with a fun quiz!",
      level: lang === "ar" ? "سهل" : "Easy",
      tag: lang === "ar" ? "لعبة سينمائية" : "Cinema Game",
      icon: "🧠",
      playLink: "/quiz",
    },
    {
      slug: "guess-movie",
      title: lang === "ar" ? "خمن الفيلم" : "Guess The Movie",
      desc:
        lang === "ar"
          ? "خمن اسم الفيلم من البوستر قبل انتهاء الوقت!"
          : "Guess the movie name from the poster before time runs out!",
      level: lang === "ar" ? "متوسط" : "Medium",
      tag: lang === "ar" ? "لعبة سينمائية" : "Cinema Game",
      icon: "🎬",
      playLink: "/guess-movie",
    },
    {
      slug: "cine-match",
      title: lang === "ar" ? "CineMatch (لعبة الذاكرة)" : "CineMatch (Memory Game)",
      desc:
        lang === "ar"
          ? "اقلب البطاقات واصنع الأزواج قبل انتهاء الوقت!"
          : "Flip cards and match pairs before time runs out!",
      level: lang === "ar" ? "صعب" : "Hard",
      tag: lang === "ar" ? "لعبة سينمائية" : "Cinema Game",
      icon: "🎴",
      playLink: "/cine-match",
    },
  ];

  return (
    <div className="min-h-screen px-4 pb-20 text-white">
      <div className="max-w-5xl mx-auto pt-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          {lang === "ar" ? "🎮 قسم الألعاب" : "🎮 Games Section"}
        </h1>
        <p className="text-gray-300 mb-8">
          {lang === "ar"
            ? "اختر لعبة واستمتع بتحديات سينمائية ممتعة!"
            : "Choose a game and enjoy fun cinema challenges!"}
        </p>

        <div className="grid gap-6">
          {games.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[2.5rem] bg-zinc-900/40 border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs inline-flex px-4 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold mb-4">
                    {g.tag}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                    <span className="text-3xl">{g.icon}</span> {g.title}
                  </h2>

                  <p className="text-gray-300 mt-2">{g.desc}</p>
                  <p className="text-sm mt-2 text-gray-400">
                    {lang === "ar" ? "الصعوبة:" : "Difficulty:"}{" "}
                    <span className="text-white font-bold">{g.level}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* ✅ Details */}
                  <NavLink
                    to={`/games/${g.slug}`}
                    className="px-6 py-3 rounded-2xl bg-zinc-800/60 border border-white/10 hover:bg-zinc-700 transition font-bold"
                  >
                    {lang === "ar" ? "تفاصيل" : "Details"}
                  </NavLink>

                  {/* ✅ Play */}
                  <NavLink
                    to={g.playLink}
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-extrabold shadow-lg"
                  >
                    {lang === "ar" ? "ابدأ الآن" : "Play Now"}
                  </NavLink>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
