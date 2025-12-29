export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;

  const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
}
