import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-14 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold">Privacy Policy</h1>

        <p className="text-gray-300 leading-relaxed">
          At CineReview, we respect your privacy. This website may use cookies and third-party services
          such as Google Analytics or Google AdSense to improve user experience.
        </p>

        <h2 className="text-2xl font-bold mt-6">Cookies</h2>
        <p className="text-gray-300 leading-relaxed">
          Cookies may be used to store user preferences and measure traffic. You can disable cookies
          in your browser settings.
        </p>

        <h2 className="text-2xl font-bold mt-6">Third Party Ads</h2>
        <p className="text-gray-300 leading-relaxed">
          Google and its partners may use cookies to serve ads based on your visits to this site.
        </p>

        <p className="text-gray-400 text-sm">
          If you have any questions, contact us through the Contact page.
        </p>
      </div>
    </motion.div>
  );
}
