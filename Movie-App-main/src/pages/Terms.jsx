import { motion } from "framer-motion";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Terms & <span className="text-red-500">Conditions</span>
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">
          By using CineReview, you agree to the following terms and conditions.
        </p>

        <div className="mt-10 space-y-5">
          <Section title="1) Use of Website">
            You agree to use this website for personal and lawful purposes only.
          </Section>

          <Section title="2) Content Accuracy">
            We strive to keep movie data accurate, but information may be incomplete or outdated.
          </Section>

          <Section title="3) External Links">
            Our site may contain links to third-party websites. We are not responsible for their content.
          </Section>

          <Section title="4) Disclaimer">
            This site uses the TMDB API but is not endorsed or certified by TMDB.
          </Section>

          <Section title="5) Updates">
            These terms may be updated at any time. Continued use of the site means acceptance of updates.
          </Section>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}
