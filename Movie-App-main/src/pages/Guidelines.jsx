import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function Guidelines() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-5xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          {isAr ? "قواعد المجتمع" : "Community Guidelines"}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed text-lg">
          {isAr
            ? "نحن نرحّب بجميع محبي الأفلام في CineReview. هذه القواعد وضعت لحماية المجتمع وضمان أن تكون المراجعات والتعليقات مفيدة ومحترمة."
            : "We welcome all movie lovers at CineReview. These rules exist to protect our community and ensure reviews and comments remain respectful, safe, and useful."}
        </p>

        <div className="mt-10 space-y-6">
          <Rule
            title={isAr ? "✅ 1) الاحترام أولاً" : "✅ 1) Respect comes first"}
            text={
              isAr
                ? "يُمنع السب والشتم أو الهجوم على الآخرين بسبب آرائهم. اختلاف الآراء طبيعي، لكن الأسلوب يجب أن يبقى محترمًا."
                : "No insults, hate, or attacking people for their opinions. Disagreeing is normal, but respect is required."
            }
          />

          <Rule
            title={
              isAr
                ? "🚫 2) منع خطاب الكراهية"
                : "🚫 2) No hate speech"
            }
            text={
              isAr
                ? "أي محتوى يتضمن تمييزًا أو تحريضًا ضد فئة معينة بسبب الدين أو العرق أو الجنسية أو الجنس سيتم حذفه فورًا."
                : "Any content that promotes discrimination or violence based on race, religion, nationality, gender, or identity will be removed immediately."
            }
          />

          <Rule
            title={
              isAr
                ? "🧠 3) المراجعات يجب أن تكون بشرية وحقيقية"
                : "🧠 3) Reviews must be real and human"
            }
            text={
              isAr
                ? "نحن نشجع كتابة مراجعات حقيقية: ماذا أحببت؟ ماذا لم يعجبك؟ هل تنصح الفيلم؟ هذا ما يجعل الموقع مفيدًا."
                : "We encourage honest reviews: what you liked, what you didn’t, and whether you recommend it. This is what makes CineReview valuable."
            }
          />

          <Rule
            title={
              isAr
                ? "📌 4) منع نسخ المحتوى"
                : "📌 4) No copied content"
            }
            text={
              isAr
                ? "يُمنع نسخ مراجعات أو مقالات من مواقع أخرى. المراجعة يجب أن تكون من رأيك أنت."
                : "Do not copy reviews or articles from other websites. Your review must be written in your own words."
            }
          />

          <Rule
            title={
              isAr
                ? "⚠️ 5) منع المحتوى غير اللائق"
                : "⚠️ 5) No inappropriate content"
            }
            text={
              isAr
                ? "أي محتوى يتضمن كلمات خادشة، أو محتوى إباحي، أو عنف مفرط سيتم حذفه."
                : "Any content containing explicit sexual material, extreme violence, or offensive words may be removed."
            }
          />

          <Rule
            title={
              isAr
                ? "🔒 6) الخصوصية والأمان"
                : "🔒 6) Privacy and safety"
            }
            text={
              isAr
                ? "لا تشارك معلوماتك الشخصية مثل رقم الهاتف، العنوان، أو أي بيانات حساسة داخل المراجعات."
                : "Do not share personal info like phone numbers, addresses, or sensitive data in reviews."
            }
          />

          <Rule
            title={
              isAr
                ? "✅ 7) الإبلاغ عن المشاكل"
                : "✅ 7) Reporting issues"
            }
            text={
              isAr
                ? "إذا لاحظت محتوى مزعج أو مخالف، يمكنك التواصل معنا عبر صفحة Contact وسنتعامل مع الأمر بسرعة."
                : "If you notice abusive or harmful content, contact us via the Contact page and we’ll handle it quickly."
            }
          />

          <div className="mt-12 p-6 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-2">
              {isAr ? "🎬 هدفنا" : "🎬 Our Goal"}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {isAr
                ? "هدف CineReview هو بناء منصة ممتعة وآمنة لمحبي الأفلام، عبر محتوى أصلي ومراجعات بشرية تساعد الآخرين على اختيار ما يشاهدونه."
                : "CineReview aims to build a fun and safe platform for movie lovers through original human content and reviews that help others choose what to watch."
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Rule({ title, text }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-300 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}
