const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;

async function fetchTMDB(endpoint) {
  const url = `${BASE_URL}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("TMDB request failed");
  }

  return res.json();
}

// ✅ Trending Movies
export const getTrendingMovies = () => fetchTMDB("/trending/movie/week");

// ✅ Popular Movies
export const getPopularMovies = (page = 1) =>
  fetchTMDB(`/movie/popular?page=${page}`);

// ✅ Top Rated Movies
export const getTopRatedMovies = (page = 1) =>
  fetchTMDB(`/movie/top_rated?page=${page}`);

// ✅ Movie Details
export const getMovieDetails = (id) =>
  fetchTMDB(`/movie/${id}?append_to_response=videos,credits`);

// ✅ Search Movies
export const searchMovies = (query) =>
  fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}`);

// ✅ Genres
export const getGenres = () => fetchTMDB("/genre/movie/list");

// ✅ Movies by Genre
export const getMoviesByGenre = (genreId, page = 1) =>
  fetchTMDB(`/discover/movie?with_genres=${genreId}&page=${page}`);
