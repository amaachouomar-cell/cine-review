import { useParams, Link } from "react-router-dom";
import articles from "../../data/articles";
import { motion } from "framer-motion";

export default function BlogPost() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <Link to="/blog" className="text-red-400 underline mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-4xl mx-auto pt-12">
        <Link to="/blog" className="text-red-400 underline text-sm">
          ← Back to Blog
        </Link>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4">
          {article.title}
        </h1>

        <p className="text-gray-500 text-sm mt-3">📅 {article.date}</p>

        <div
          className="mt-10 prose prose-invert max-w-none prose-p:text-gray-300 prose-li:text-gray-300"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </motion.div>
  );
}
