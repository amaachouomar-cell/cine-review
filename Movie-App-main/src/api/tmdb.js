// src/api/tmdb.js

const API_BASE = "https://api.themoviedb.org/3";

const TMDB_KEY =
  import.meta.env.VITE_TMDB_API_KEY ||
  import.meta.env.VITE_TMDB_KEY ||
  "";

// ✅ صور TMDB
export const getImageUrl = (path, size = "w780") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

// ✅ Fetch الرئيسي
async function fetchTMDB(endpoint) {
  if (!TMDB_KEY) {
    console.error("❌ TMDB API KEY is missing. Check .env / Vercel env.");
    throw new Error("TMDB API KEY is missing. Please add it in .env / Vercel.");
  }

  const url = `${API_BASE}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${TMDB_KEY}&language=en-US`;

  const res = await fetch(url);

  if (!res.ok) {
    const msg = `TMDB Error: ${res.status} ${res.statusText}`;
    console.error(msg);
    throw new Error(msg);
  }

  return res.json();
}

/* ✅ Home Page */
export const getTrendingMovies = () =>
  fetchTMDB("/trending/movie/week");

export const getPopularMovies = () =>
  fetchTMDB("/movie/popular");

export const getTopRatedMovies = () =>
  fetchTMDB("/movie/top_rated");

export const getGenres = () =>
  fetchTMDB("/genre/movie/list");

export const getMoviesByGenre = (genreId) =>
  fetchTMDB(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`);

export const searchMovies = (query) =>
  fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}`);

/* ✅ Movie Details Page */
export const getMovieDetails = (id) =>
  fetchTMDB(`/movie/${id}`);

export const getMovieCredits = (id) =>
  fetchTMDB(`/movie/${id}/credits`);

export const getSimilarMovies = (id) =>
  fetchTMDB(`/movie/${id}/similar`);

// ✅ ✅ ✅ THIS IS WHAT WAS MISSING
export const getMovieVideos = (id) =>
  fetchTMDB(`/movie/${id}/videos`);
