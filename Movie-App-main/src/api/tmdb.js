const BASE_URL = "https://api.themoviedb.org/3";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

if (!TMDB_TOKEN) {
  console.warn("⚠️ TMDB TOKEN missing: add VITE_TMDB_TOKEN in .env and Vercel.");
}

// ✅ fetch helper
export async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB Error ${res.status}: ${text}`);
  }

  return res.json();
}

/* ✅ دوال تستخدم في الموقع */
export async function getTrendingMovies() {
  return tmdbFetch("/trending/movie/week");
}

export async function getPopularMovies() {
  return tmdbFetch("/movie/popular");
}

export async function getTopRatedMovies() {
  return tmdbFetch("/movie/top_rated");
}

export async function searchMovies(query) {
  return tmdbFetch("/search/movie", { query, include_adult: false });
}

export async function getMovieDetails(id) {
  return tmdbFetch(`/movie/${id}`);
}

export async function getMovieImages(id) {
  return tmdbFetch(`/movie/${id}/images`);
}
