import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import FAQ from "./pages/FAQ";
import Guidelines from "./pages/Guidelines";
import Quiz from "./pages/Quiz";
import Game from "./pages/Game";
import Games from "./pages/Games";
import GameDetails from "./pages/GameDetails";
import CineJigsaw from "./pages/CineJigsaw";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Reviews from "./pages/Reviews";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";

import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CineQuest from "./pages/CineQuest";

import NotFound from "./pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith("/movie/");

  return (
    <>
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
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/cinejigsaw" element={<CineJigsaw />} />

<Route path="/quiz" element={<Quiz />} />
<Route path="/game" element={<Game />} />
<Route path="/games" element={<Games />} />
<Route path="/games/:slug" element={<GameDetails />} />
<Route path="/cinequest" element={<CineQuest />} />
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />

          {/* ✅ Legal Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
<Route path="/faq" element={<FAQ />} />
<Route path="/guidelines" element={<Guidelines />} />


          {/* ✅ Movie Details */}
          <Route path="/movie/:id" element={<MovieDetails />} />

          {/* ✅ NotFound */}
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
