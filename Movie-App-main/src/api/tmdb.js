const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// ✅ Simple cache (Memory)
const cache = new Map();

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB request failed");

  const data = await res.json();
  cache.set(url, data);
  return data;
}

/* ✅ Popular Movies */
export async function getPopularMovies(page = 1) {
  return fetchJson(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
}

/* ✅ Trending Movies */
export async function getTrendingMovies(page = 1) {
  return fetchJson(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
  );
}

/* ✅ Top Rated Movies */
export async function getTopRatedMovies(page = 1) {
  return fetchJson(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
  );
}

/* ✅ Popular TV Shows */
export async function getPopularTV(page = 1) {
  return fetchJson(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
}

/* ✅ Search Movies */
export async function searchMovies(query, page = 1) {
  return fetchJson(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      query
    )}&page=${page}`
  );
}

/* ✅ Movie Details */
export async function getMovieDetails(id) {
  return fetchJson(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
}

/* ✅ Videos */
export async function getMovieVideos(id) {
  return fetchJson(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
}

/* ✅ Credits */
export async function getMovieCredits(id) {
  return fetchJson(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
}

/* ✅ Similar Movies */
export async function getSimilarMovies(id, page = 1) {
  return fetchJson(
    `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&page=${page}`
  );
}

/* ✅ Genres */
export async function getGenres() {
  const data = await fetchJson(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  return data.genres;
}

/* ✅ Movies By Genre */
export async function getMoviesByGenre(genreId, page = 1) {
  const data = await fetchJson(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
  );
  return data.results;
}
