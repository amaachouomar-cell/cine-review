import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Privacy <span className="text-red-500">Policy</span>
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed">
          Your privacy is important to us. This Privacy Policy explains what data we collect and how we use it.
        </p>

        <div className="mt-10 space-y-5">
          <Section title="1) Information We Collect">
            We do not collect personal information unless you voluntarily provide it (e.g., through email).
          </Section>

          <Section title="2) Cookies">
            Our website may use cookies for analytics and performance improvements. Third-party services (like Google) may also set cookies.
          </Section>

          <Section title="3) Third-Party Services">
            We may use third-party tools such as Google Analytics or AdSense to understand usage and show ads. These services may collect data based on your browser behavior.
          </Section>

          <Section title="4) Security">
            We take reasonable measures to protect your data, but no method of online transmission is 100% secure.
          </Section>

          <Section title="5) Contact">
            If you have any questions about this policy, contact us via email.
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
