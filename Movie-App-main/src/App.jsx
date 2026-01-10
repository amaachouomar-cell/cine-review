import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Reviews from "./pages/Reviews";

import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";

import Games from "./pages/Games";
import GameDetails from "./pages/GameDetails";

import Quiz from "./pages/Quiz";

import FAQ from "./pages/FAQ";
import Guidelines from "./pages/Guidelines";

import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

import NotFound from "./pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith("/movie/");

  return (
    <>
      {/* ✅ Spacer for navbar (smooth) */}
      <motion.div
        initial={false}
        animate={{ height: isDetailsPage ? 0 : 86 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ✅ Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/top-rated" element={<TopRated />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/reviews" element={<Reviews />} />

          {/* ✅ Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* ✅ Games */}
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GameDetails />} />

          {/* ✅ Extra Pages */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/guidelines" element={<Guidelines />} />

          {/* ✅ Legal Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

          {/* ✅ Movie Details */}
          <Route path="/movie/:id" element={<MovieDetails />} />

          {/* ✅ Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
}
