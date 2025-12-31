import { motion } from "framer-motion";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-14 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold">Terms of Service</h1>

        <p className="text-gray-300 leading-relaxed">
          By using CineReview, you agree to these terms. All content is provided for informational
          purposes only. We do not host movies or provide streaming services.
        </p>

        <h2 className="text-2xl font-bold mt-6">Use of Content</h2>
        <p className="text-gray-300 leading-relaxed">
          You may not copy or republish our reviews without permission. You are responsible for your
          use of this website.
        </p>

        <h2 className="text-2xl font-bold mt-6">External Links</h2>
        <p className="text-gray-300 leading-relaxed">
          We may link to external websites. We are not responsible for content on those sites.
        </p>
      </div>
    </motion.div>
  );
}
