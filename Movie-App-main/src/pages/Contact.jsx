import { motion } from "framer-motion";

export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-14 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold">Contact</h1>

        <p className="text-gray-300 leading-relaxed">
          If you have any questions, suggestions, or business inquiries, feel free to contact us:
        </p>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
          <p className="text-gray-200">
            📧 Email: <span className="text-red-500 font-semibold">amaachou.omar@gmail.com</span>
          </p>
        </div>

        <p className="text-gray-400 text-sm">
          We usually respond within 24-48 hours.
        </p>
      </div>
    </motion.div>
  );
}
