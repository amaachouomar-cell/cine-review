import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log("TMDB KEY:", API_KEY);

const BASE_URL = "https://api.themoviedb.org/3";

/* ✅ Helper */
async function fetchJson(url, params = {}) {
  if (!API_KEY) {
    throw new Error("❌ TMDB API KEY is missing. Check your .env file!");
  }

  const res = await axios.get(`${BASE_URL}${url}`, {
    params: {
      api_key: API_KEY,
      ...params,
    },
  });

  return res.data;
}

/* ✅ Popular */
export const getPopularMovies = (page = 1) =>
  fetchJson("/movie/popular", { page });

/* ✅ Trending */
export const getTrendingMovies = (page = 1) =>
  fetchJson("/trending/movie/week", { page });

/* ✅ Top Rated */
export const getTopRatedMovies = (page = 1) =>
  fetchJson("/movie/top_rated", { page });

/* ✅ Search */
export const searchMovies = (query, page = 1) =>
  fetchJson("/search/movie", { query, page });

/* ✅ Movie Details */
export const getMovieDetails = (id) => fetchJson(`/movie/${id}`);

/* ✅ Videos */
export const getMovieVideos = (id) => fetchJson(`/movie/${id}/videos`);

/* ✅ Credits */
export const getMovieCredits = (id) => fetchJson(`/movie/${id}/credits`);

/* ✅ Similar */
export const getSimilarMovies = (id) => fetchJson(`/movie/${id}/similar`);

/* ✅ Genres */
export const getGenres = async () => {
  const data = await fetchJson("/genre/movie/list");
  return data.genres;
};

/* ✅ Movies by Genre */
export const getMoviesByGenre = async (genreId, page = 1) => {
  const data = await fetchJson("/discover/movie", {
    with_genres: genreId,
    page,
  });
  return data.results;
};
