import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function FAQ() {
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
          {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed text-lg">
          {isAr
            ? "جمعنا هنا أهم الأسئلة التي قد يطرحها المستخدمون حول CineReview. هذا يساعدك على فهم طريقة عمل الموقع وكيفية الاستفادة منه بشكل أفضل."
            : "Here are the most common questions users ask about CineReview. This section helps you understand how the website works and how to get the best experience."}
        </p>

        <div className="mt-10 space-y-6">
          <FAQItem
            q={isAr ? "هل الموقع مجاني؟" : "Is the website free to use?"}
            a={
              isAr
                ? "نعم، CineReview مجاني بالكامل. يمكنك البحث عن الأفلام، قراءة المعلومات، وحفظ أفلامك المفضلة بدون أي رسوم."
                : "Yes. CineReview is completely free. You can search movies, explore details, and save favorites without paying anything."
            }
          />

          <FAQItem
            q={
              isAr
                ? "هل أحتاج لإنشاء حساب؟"
                : "Do I need to create an account?"
            }
            a={
              isAr
                ? "لا تحتاج لإنشاء حساب. الموقع مصمم ليكون بسيطًا وسهل الاستخدام. ومع ذلك، نخطط مستقبلًا لإضافة نظام حسابات لتطوير تجربة المراجعات."
                : "No account is required. CineReview is built to be simple and easy. In the future, we may add user accounts to improve the review experience."
            }
          />

          <FAQItem
            q={
              isAr
                ? "من أين يحصل الموقع على بيانات الأفلام؟"
                : "Where does CineReview get movie data from?"
            }
            a={
              isAr
                ? "نحن نستخدم TMDB API لجلب معلومات الأفلام مثل الصور والتقييمات والتواريخ. لكننا نقدم تجربة مختلفة عبر مقالاتنا، المراجعات، والقوائم."
                : "We use the TMDB API for movie info like posters, ratings and release dates. However, we add value through original articles, user reviews and curated content."
            }
          />

          <FAQItem
            q={
              isAr
                ? "هل الموقع تابع أو مدعوم من TMDB؟"
                : "Is CineReview endorsed by TMDB?"
            }
            a={
              isAr
                ? "لا، الموقع يستخدم بيانات TMDB لكنه غير معتمد أو مدعوم رسميًا من TMDB."
                : "No. CineReview uses TMDB data but is not endorsed or certified by TMDB."
            }
          />

          <FAQItem
            q={
              isAr
                ? "كيف يمكنني كتابة مراجعة؟"
                : "How can I write a review?"
            }
            a={
              isAr
                ? "من خلال صفحة Reviews يمكنك كتابة عنوان مراجعة، رأيك في الفيلم، وتقييمك. نحاول أن نجعل المراجعات بسيطة وحقيقية لرفع جودة الموقع."
                : "Go to the Reviews page. You can write a title, your opinion, and your rating. We keep reviews simple and authentic to improve site quality."
            }
          />

          <FAQItem
            q={
              isAr
                ? "هل المراجعات تظهر للجميع؟"
                : "Are reviews public?"
            }
            a={
              isAr
                ? "حاليًا تُحفظ المراجعات في جهاز المستخدم (local storage). مستقبلاً سيتم ربطها بقاعدة بيانات مثل Firebase لتصبح عامة لكل المستخدمين."
                : "Currently, reviews are stored in your browser (local storage). In the future, we plan to connect them to a database like Firebase to make them public."
            }
          />

          <FAQItem
            q={
              isAr
                ? "هل الموقع سريع على الهاتف؟"
                : "Is CineReview mobile-friendly?"
            }
            a={
              isAr
                ? "نعم، الموقع مبني بتصميم متجاوب وسريع جدًا على الهاتف، كما أنه يدعم اللغة العربية والإنجليزية."
                : "Yes. CineReview is fully responsive and optimized for mobile. It supports both Arabic and English."
            }
          />

          <FAQItem
            q={
              isAr
                ? "كيف يمكنني التواصل معكم؟"
                : "How can I contact you?"
            }
            a={
              isAr
                ? "يمكنك التواصل معنا عبر صفحة Contact أو إرسال رسالة مباشرة إلى البريد الإلكتروني الموجود هناك."
                : "You can contact us via the Contact page or email us directly using the address provided there."
            }
          />

          <FAQItem
            q={
              isAr
                ? "هل هناك إعلانات على الموقع؟"
                : "Does CineReview show ads?"
            }
            a={
              isAr
                ? "قد يتم عرض الإعلانات مستقبلًا عبر Google AdSense، لكننا نلتزم بتقديم محتوى مفيد وغير مزعج للمستخدم."
                : "Ads may be shown in the future through Google AdSense. We aim to keep the experience clean and useful for readers."
            }
          />

          <div className="mt-12 p-6 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-2">
              {isAr ? "📌 ملاحظة مهمة" : "📌 Important Note"}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {isAr
                ? "هدفنا هو تقديم تجربة مشاهدة وتقييم مفيدة للمستخدمين. نحن نضيف محتوى بشري أصلي (مراجعات ومقالات) حتى لا يكون الموقع مجرد نسخة من بيانات API."
                : "Our goal is to provide a helpful movie discovery and review experience. We add original human content (reviews & articles) to avoid being just an API-based duplicate website."
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({ q, a }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold text-white">{q}</h2>
      <p className="text-gray-300 mt-3 leading-relaxed">{a}</p>
    </div>
  );
}
