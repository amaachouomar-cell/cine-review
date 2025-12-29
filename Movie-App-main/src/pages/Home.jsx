import React, { useState, useEffect, useMemo } from "react";
import {
  getPopularMovies,
  searchMovies,
  getGenres,
  getMoviesByGenre,
} from "../api/tmdb";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
      <div className="h-72 bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const { t } = useLang();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const skeletons = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />),
    []
  );

  // ✅ Load query from URL (if you add /?q=.. later)
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery) {
      setQuery(urlQuery);
      setSelectedGenre(null);
      setPage(1);
    }
  }, [searchParams]);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // ✅ Fetch genres once
  useEffect(() => {
    async function fetchGenres() {
      try {
        const genresData = await getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    }
    fetchGenres();
  }, []);

  // ✅ Fetch movies
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const cacheKey = `movies_${debouncedQuery}_${selectedGenre}_${page}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const data = JSON.parse(cached);
          setResults(data.results);
          setTotalPages(data.total_pages);
          setLoading(false);
          return;
        }

        let data;
        if (debouncedQuery.trim()) {
          data = await searchMovies(debouncedQuery, page);
        } else if (selectedGenre) {
          const genreData = await getMoviesByGenre(selectedGenre, page);
          data = { results: genreData, total_pages: 500 };
        } else {
          data = await getPopularMovies(page);
        }

        const finalData = {
          results: data.results,
          total_pages: data.total_pages > 500 ? 500 : data.total_pages,
        };

        setResults(finalData.results);
        setTotalPages(finalData.total_pages);
        sessionStorage.setItem(cacheKey, JSON.stringify(finalData));
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [debouncedQuery, selectedGenre, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setQuery("");
    setPage(1);
  };

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-4 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white"
    >
      <div className="max-w-6xl mx-auto pt-10">
        {/* ✅ HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30 backdrop-blur-xl p-6 md:p-10">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {(t?.heroTitle || "🎬 CineReview")}{" "}
            <span className="text-red-500">Review</span>
          </h1>

          <p className="text-gray-300 mt-3 max-w-xl leading-relaxed">
            {t?.heroDesc ||
              "Discover trending movies and shows, search fast, and enjoy a premium smooth experience."}
          </p>

          <div className="mt-6">
            <SearchBar
              value={query}
              onChange={(val) => {
                setQuery(val);
                setSelectedGenre(null);
                setPage(1);
              }}
              onSubmit={() => {
                window.scrollTo({ top: 520, behavior: "smooth" });
              }}
            />
          </div>
        </div>

        {/* ✅ HERO SLIDER */}
        <HeroSlider />

        {/* ✅ GENRES */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          <button
            onClick={() => handleGenreChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
              selectedGenre === null
                ? "bg-red-600 text-white border-red-500"
                : "bg-zinc-900/60 text-gray-300 border-white/10 hover:bg-zinc-800"
            }`}
          >
            {t?.all || "All"}
          </button>

          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
                selectedGenre === genre.id
                  ? "bg-red-600 text-white border-red-500"
                  : "bg-zinc-900/60 text-gray-300 border-white/10 hover:bg-zinc-800"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* ✅ Section Title */}
        <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl md:text-2xl font-bold">
            {isSearching ? "🔎 Search Results" : "🔥 Popular Movies"}
          </h2>
          <span className="text-sm text-gray-400">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="h-px bg-white/10 mt-4" />

        {/* ✅ GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
            {skeletons}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8"
          >
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )}

        {/* ✅ PAGINATION */}
        <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              page === 1
                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {t?.prev || "Prev"}
          </button>

          <span className="text-gray-300 text-sm px-3">
            {t?.page || "Page"} <b className="text-white">{page}</b> /{" "}
            <b className="text-white">{totalPages}</b>
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              page === totalPages
                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {t?.next || "Next"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
