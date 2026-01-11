import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Reviews from "../components/Reviews";

// عدّل المسار إذا ملف tmdb.js عندك بمكان مختلف
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
} from "../api/tmdb";

const TMDB_IMG = (path, size = "w780") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

const YT_THUMB = (key) => `https://img.youtube.com/vi/${key}/hqdefault.jpg`;

function minutesToHrs(min) {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
    </svg>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="min-h-[75vh] grid place-items-center">
      <div className="w-[min(980px,94vw)]">
        <div className="h-6 w-44 rounded bg-white/10 animate-pulse mb-4" />
        <div className="h-[280px] md:h-[420px] w-full rounded-3xl bg-white/10 animate-pulse mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-44 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-44 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function TrailerModal({ open, onClose, ytKey, title }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-[min(920px,96vw)] rounded-2xl border border-white/10 bg-[#0b0f18]/90 shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-white/90 text-sm font-semibold truncate">{title || "Trailer"}</div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
            aria-label="Close trailer"
          >
            ✕
          </button>
        </div>
        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${ytKey}?autoplay=1&rel=0`}
            title="YouTube trailer"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const trailer = useMemo(() => {
    const list = videos || [];
    const yt = list.filter((v) => v.site === "YouTube");
    return (
      yt.find((v) => v.type === "Trailer") ||
      yt.find((v) => v.type === "Teaser") ||
      yt[0] ||
      null
    );
  }, [videos]);

  const director = useMemo(() => {
    const crew = credits?.crew || [];
    return crew.find((c) => c.job === "Director")?.name || "—";
  }, [credits]);

  const cast = useMemo(() => (credits?.cast || []).slice(0, 14), [credits]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const [m, c, v, s] = await Promise.all([
          getMovieDetails(id),
          getMovieCredits(id),
          getMovieVideos(id),
          getSimilarMovies(id),
        ]);

        if (!alive) return;

        setMovie(m);
        setCredits(c);
        setVideos(v?.results || []);
        setSimilar((s?.results || []).slice(0, 12));
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Skeleton />;

  if (!movie) {
    return (
      <div className="min-h-[70vh] grid place-items-center text-white/70">
        <div className="w-[min(520px,92vw)] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-lg text-white/90 font-semibold mb-2">لم نستطع تحميل الفيلم</div>
          <div className="text-sm text-white/60 mb-4">حاول مرة أخرى أو ارجع للصفحة السابقة.</div>
          <button
            onClick={() => nav(-1)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/90"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name || "Movie";
  const backdrop = TMDB_IMG(movie.backdrop_path, "w1280");
  const poster = TMDB_IMG(movie.poster_path, "w500");
  const rating = clamp((movie.vote_average || 0).toFixed(1), 0, 10);
  const genres = (movie.genres || []).slice(0, 3).map((g) => g.name);

  return (
    <div className="text-white">
      {/* HERO */}
      <section className="relative">
        {/* خلفية */}
        <div className="absolute inset-0 -z-10">
          <div
            className="h-[520px] md:h-[560px] w-full"
            style={{
              backgroundImage: backdrop ? `url(${backdrop})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#0b0f18]/85 to-[#0b0f18]" />
        </div>

        <div className="mx-auto w-[min(1100px,94vw)] pt-6 pb-6 md:pt-10 md:pb-10">
          {/* أعلى: رجوع */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white/90"
            >
              <IconBack />
              Back
            </button>

            {/* مكان لزر مشاركة/حفظ لاحقاً */}
            <div className="opacity-0 md:opacity-100 select-none text-white/40 text-xs">
              CineReview • Details
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[340px_1fr] items-end">
            {/* بوستر */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-b from-white/10 to-transparent blur-xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                {poster ? (
                  <img
                    src={poster}
                    alt={title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] grid place-items-center text-white/50">
                    No Poster
                  </div>
                )}
              </div>
            </div>

            {/* معلومات */}
            <div className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip>
                  <IconStar />
                  <span className="font-semibold">{rating}</span>
                  <span className="text-white/50">/10</span>
                </Chip>
                <Chip>{formatDate(movie.release_date)}</Chip>
                <Chip>{minutesToHrs(movie.runtime)}</Chip>
                <Chip>{movie.original_language?.toUpperCase?.() || "—"}</Chip>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {title}
              </h1>

              {movie.tagline ? (
                <div className="text-white/70 mt-2 italic">“{movie.tagline}”</div>
              ) : null}

              <div className="flex flex-wrap gap-2 mt-4">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs text-white/75 px-3 py-1 rounded-full border border-white/10 bg-white/5"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 mt-6 md:grid-cols-3">
                <GlassCard className="p-4">
                  <div className="text-xs text-white/50 mb-1">Director</div>
                  <div className="text-sm text-white/90 font-semibold">{director}</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-xs text-white/50 mb-1">Status</div>
                  <div className="text-sm text-white/90 font-semibold">
                    {movie.status || "—"}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-xs text-white/50 mb-1">Budget</div>
                  <div className="text-sm text-white/90 font-semibold">
                    {movie.budget ? `$${movie.budget.toLocaleString()}` : "—"}
                  </div>
                </GlassCard>
              </div>

              {/* أزرار */}
              <div className="flex flex-wrap gap-3 mt-6">
                {trailer?.key ? (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 px-5 py-3 text-sm font-semibold shadow-[0_18px_60px_rgba(255,0,0,0.18)]"
                  >
                    <IconPlay />
                    Watch Trailer
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold border border-white/10 text-white/70 cursor-not-allowed"
                    disabled
                  >
                    <IconPlay />
                    Trailer Unavailable
                  </button>
                )}

                {movie.homepage ? (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 px-5 py-3 text-sm font-semibold border border-white/10"
                  >
                    Official Site
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto w-[min(1100px,94vw)] pb-14">
        <div className="grid gap-6 md:grid-cols-[1fr_360px] items-start">
          {/* OVERVIEW */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Overview</div>
              <div className="text-xs text-white/40">
                TMDB • {movie.vote_count?.toLocaleString?.() || "—"} votes
              </div>
            </div>

            <p className="text-white/75 leading-relaxed">
              {movie.overview || "لا يوجد وصف متاح لهذا الفيلم."}
            </p>

            {/* Trailer inline card (IMDB style صغير بالوسط) */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-white/90 mb-3">Trailer</div>

              <div className="grid place-items-center">
                <div className="w-[min(760px,100%)]">
                  <GlassCard className="p-3 md:p-4">
                    {trailer?.key ? (
                      <button
                        onClick={() => setTrailerOpen(true)}
                        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
                        aria-label="Open trailer"
                      >
                        <div className="relative w-full aspect-video">
                          <img
                            src={YT_THUMB(trailer.key)}
                            alt="Trailer thumbnail"
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          {/* زر تشغيل */}
                          <div className="absolute inset-0 grid place-items-center">
                            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.5)] group-hover:bg-white/15 transition">
                              <span className="h-10 w-10 rounded-full bg-red-600 grid place-items-center shadow-[0_20px_60px_rgba(255,0,0,0.25)]">
                                <IconPlay />
                              </span>
                              <div className="text-left">
                                <div className="text-sm font-bold">Play Trailer</div>
                                <div className="text-xs text-white/60 line-clamp-1">
                                  {trailer.name || "Watch on YouTube"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
                        Trailer غير متوفر لهذا الفيلم.
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* SIDE INFO */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <GlassCard className="p-5">
              <div className="text-lg font-bold mb-4">Quick Facts</div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/50">Original Title</span>
                  <span className="text-white/85 font-semibold text-right">
                    {movie.original_title || title}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/50">Release</span>
                  <span className="text-white/85 font-semibold">{formatDate(movie.release_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/50">Runtime</span>
                  <span className="text-white/85 font-semibold">{minutesToHrs(movie.runtime)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/50">Revenue</span>
                  <span className="text-white/85 font-semibold">
                    {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Similar */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold">Similar</div>
                <div className="text-xs text-white/40">{similar?.length || 0} items</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {similar?.slice(0, 6).map((m) => (
                  <Link
                    key={m.id}
                    to={`/movie/${m.id}`}
                    className="group block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    title={m.title}
                  >
                    <div className="aspect-[2/3] bg-black/30">
                      {m.poster_path ? (
                        <img
                          src={TMDB_IMG(m.poster_path, "w342")}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-white/40 text-xs">
                          No Poster
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* CAST */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-extrabold">Cast</div>
            <div className="text-xs text-white/40">Top {cast.length}</div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max pb-1">
              {cast.map((p) => {
                const avatar = p.profile_path ? TMDB_IMG(p.profile_path, "w185") : "";
                return (
                  <div
                    key={p.cast_id || p.credit_id || p.id}
                    className="w-[110px] md:w-[125px]"
                  >
                    <div className="relative">
                      {/* هالة */}
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-xl" />
                      <div className="relative h-[92px] w-[92px] md:h-[104px] md:w-[104px] mx-auto rounded-full overflow-hidden border border-white/10 bg-white/5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-white/40 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <div className="text-sm font-semibold text-white/90 line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-xs text-white/55 line-clamp-2">
                        {p.character || "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* مودال التريلر */}
      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        ytKey={trailer?.key}
        title={trailer?.name || `${title} • Trailer`}
      />

      {/* تحسين سكرول */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar{ display:none; }
        .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }
        .line-clamp-1{
          display:-webkit-box;
          -webkit-line-clamp:1;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .line-clamp-2{
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
      `}</style>
    </div>
  );
}
