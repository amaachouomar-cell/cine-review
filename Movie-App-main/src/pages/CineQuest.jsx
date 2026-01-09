import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

const HEROES = [
  { id: "ninja", nameEn: "Ninja Critic", nameAr: "الناقد النينجا", emoji: "🥷" },
  { id: "director", nameEn: "Mini Director", nameAr: "المخرج الصغير", emoji: "🎥" },
  { id: "popcorn", nameEn: "Popcorn Hero", nameAr: "بطل الفشار", emoji: "🍿" },
];

const LEVELS = [
  { id: 1, tickets: 4, speed: 2, obstacles: 4 },
  { id: 2, tickets: 6, speed: 2.5, obstacles: 5 },
  { id: 3, tickets: 8, speed: 3.2, obstacles: 6 },
  { id: 4, tickets: 10, speed: 3.8, obstacles: 7 },
];

export default function CineQuest() {
  const { lang } = useLang();

  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const [selectedHero, setSelectedHero] = useState(null);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [ticketsCollected, setTicketsCollected] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const keys = useRef({ left: false, right: false, jump: false });

  const player = useRef({
    x: 60,
    y: 240,
    w: 40,
    h: 40,
    vy: 0,
    grounded: false,
  });

  const world = useRef({
    floor: 280,
    gravity: 0.7,
    jumpPower: -12,
    speed: 2,
    offset: 0,
  });

  const obstacles = useRef([]);
  const tickets = useRef([]);

  const currentLevelConfig = LEVELS.find((l) => l.id === level) || LEVELS[0];

  // ✅ Reset level
  function resetLevel() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cfg = currentLevelConfig;

    player.current = { x: 60, y: 240, w: 40, h: 40, vy: 0, grounded: false };
    world.current = {
      floor: 280,
      gravity: 0.7,
      jumpPower: -12,
      speed: cfg.speed,
      offset: 0,
    };

    setTicketsCollected(0);
    setGameOver(false);
    setWin(false);

    // obstacles
    obstacles.current = new Array(cfg.obstacles).fill(0).map((_, i) => ({
      x: 320 + i * 260,
      y: 250,
      w: 34,
      h: 34,
      type: i % 2 === 0 ? "enemy" : "barrier",
    }));

    // tickets
    tickets.current = new Array(cfg.tickets).fill(0).map((_, i) => ({
      x: 220 + i * 220,
      y: 200 - (i % 2) * 40,
      r: 14,
      collected: false,
    }));
  }

  // ✅ Start game after hero selection
  function startGame() {
    setStarted(true);
    resetLevel();
  }

  // ✅ Controls
  useEffect(() => {
    function down(e) {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === "ArrowUp" || e.key === " ") keys.current.jump = true;
    }

    function up(e) {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === "ArrowUp" || e.key === " ") keys.current.jump = false;
    }

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ✅ Touch controls
  function touchControl(type, val) {
    keys.current[type] = val;
  }

  // ✅ Collision
  function rectHit(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function circleHitRect(circle, rect) {
    const distX = Math.abs(circle.x - rect.x - rect.w / 2);
    const distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > rect.w / 2 + circle.r) return false;
    if (distY > rect.h / 2 + circle.r) return false;

    if (distX <= rect.w / 2) return true;
    if (distY <= rect.h / 2) return true;

    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  // ✅ Main loop
  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    function update() {
      if (gameOver || win) return;

      const p = player.current;
      const w = world.current;

      // move
      if (keys.current.left) p.x -= 4;
      if (keys.current.right) p.x += 4;

      // jump
      if (keys.current.jump && p.grounded) {
        p.vy = w.jumpPower;
        p.grounded = false;
      }

      // physics
      p.vy += w.gravity;
      p.y += p.vy;

      if (p.y + p.h >= w.floor) {
        p.y = w.floor - p.h;
        p.vy = 0;
        p.grounded = true;
      }

      // world scroll
      w.offset += w.speed;
      obstacles.current.forEach((o) => (o.x -= w.speed));
      tickets.current.forEach((t) => (t.x -= w.speed));

      // collisions (obstacles)
      obstacles.current.forEach((o) => {
        if (rectHit(p, o)) {
          setGameOver(true);
        }
      });

      // collect tickets
      tickets.current.forEach((t) => {
        if (!t.collected) {
          const circle = { x: t.x, y: t.y, r: t.r };
          if (circleHitRect(circle, p)) {
            t.collected = true;
            setTicketsCollected((prev) => prev + 1);
          }
        }
      });

      // win
      if (ticketsCollected + 1 >= currentLevelConfig.tickets) {
        const allCollected = tickets.current.every((t) => t.collected);
        if (allCollected) setWin(true);
      }

      // draw
      ctx.clearRect(0, 0, width, height);

      // background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // floor
      ctx.fillStyle = "#111";
      ctx.fillRect(0, w.floor, width, height - w.floor);

      // player
      ctx.fillStyle = "#ff4545";
      ctx.fillRect(p.x, p.y, p.w, p.h);

      ctx.fillStyle = "#fff";
      ctx.font = "18px Arial";
      ctx.fillText(selectedHero?.emoji || "🎬", p.x + 8, p.y + 26);

      // obstacles
      obstacles.current.forEach((o) => {
        ctx.fillStyle = o.type === "enemy" ? "#ffb020" : "#00c2ff";
        ctx.fillRect(o.x, o.y, o.w, o.h);
      });

      // tickets
      tickets.current.forEach((t) => {
        if (!t.collected) {
          ctx.beginPath();
          ctx.fillStyle = "#22c55e";
          ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.font = "12px Arial";
          ctx.fillText("🎟️", t.x - 10, t.y + 5);
        }
      });

      // HUD
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.fillText(
        `Level ${level} — Tickets: ${ticketsCollected}/${currentLevelConfig.tickets}`,
        12,
        22
      );

      requestRef.current = requestAnimationFrame(update);
    }

    requestRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(requestRef.current);
  }, [started, gameOver, win, level, ticketsCollected, selectedHero]);

  // ✅ Next Level
  function nextLevel() {
    if (level < LEVELS.length) {
      setLevel((prev) => prev + 1);
      setTimeout(() => resetLevel(), 100);
    } else {
      alert(lang === "ar" ? "🎉 أكملت كل المراحل!" : "🎉 You finished all levels!");
      setStarted(false);
      setSelectedHero(null);
      setLevel(1);
    }
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-10">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          🕹️ CineQuest
        </motion.h1>

        <p className="text-gray-400 mt-3 max-w-3xl">
          {lang === "ar"
            ? "لعبة مغامرات ثنائية الأبعاد — اختر بطلك، اجمع تذاكر السينما، وتجنب العوائق للوصول إلى نهاية المرحلة."
            : "A 2D adventure game — pick your hero, collect cinema tickets, dodge obstacles, and finish levels."}
        </p>

        {/* Hero select */}
        {!started && (
          <div className="mt-8 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-4">
              {lang === "ar" ? "اختر شخصيتك" : "Choose your hero"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HEROES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHero(h)}
                  className={`p-5 rounded-3xl border transition text-left ${
                    selectedHero?.id === h.id
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 bg-black/30 hover:bg-black/40"
                  }`}
                >
                  <div className="text-3xl">{h.emoji}</div>
                  <div className="mt-2 font-bold">
                    {lang === "ar" ? h.nameAr : h.nameEn}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {lang === "ar"
                      ? "شخصية قوية وسريعة."
                      : "Fast, fun and stylish."}
                  </div>
                </button>
              ))}
            </div>

            <button
              disabled={!selectedHero}
              onClick={startGame}
              className="mt-6 w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg disabled:opacity-50"
            >
              {lang === "ar" ? "ابدأ المغامرة" : "Start Adventure"}
            </button>
          </div>
        )}

        {/* Game canvas */}
        {started && (
          <div className="mt-8 space-y-4">
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <canvas
                ref={canvasRef}
                width="520"
                height="320"
                className="w-full rounded-2xl border border-white/10"
              />
            </div>

            {/* Touch controls */}
            <div className="flex items-center justify-center gap-3 md:hidden">
              <button
                onTouchStart={() => touchControl("left", true)}
                onTouchEnd={() => touchControl("left", false)}
                className="px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10"
              >
                ⬅️
              </button>

              <button
                onTouchStart={() => touchControl("jump", true)}
                onTouchEnd={() => touchControl("jump", false)}
                className="px-6 py-4 rounded-2xl bg-red-600 border border-white/10"
              >
                ⬆️
              </button>

              <button
                onTouchStart={() => touchControl("right", true)}
                onTouchEnd={() => touchControl("right", false)}
                className="px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10"
              >
                ➡️
              </button>
            </div>

            {/* Status */}
            {gameOver && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
                <h2 className="text-2xl font-bold">
                  {lang === "ar" ? "💥 خسرت!" : "💥 Game Over!"}
                </h2>
                <p className="text-gray-300 mt-2">
                  {lang === "ar"
                    ? "اصطدمت بعائق! أعد المحاولة."
                    : "You hit an obstacle! Try again."}
                </p>
                <button
                  onClick={resetLevel}
                  className="mt-4 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold"
                >
                  {lang === "ar" ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            )}

            {win && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6">
                <h2 className="text-2xl font-bold">
                  {lang === "ar" ? "🎉 ربحت المرحلة!" : "🎉 Level Completed!"}
                </h2>
                <p className="text-gray-300 mt-2">
                  {lang === "ar"
                    ? "أحسنت! انتقل للمرحلة التالية."
                    : "Great job! Continue to the next level."}
                </p>

                <button
                  onClick={nextLevel}
                  className="mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
                >
                  {lang === "ar" ? "المرحلة التالية" : "Next Level"}
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl text-sm text-gray-300">
              <b>{lang === "ar" ? "🎮 التحكم:" : "🎮 Controls:"}</b>
              <div className="mt-2">
                {lang === "ar"
                  ? "⬅️ ➡️ للتحرك | ⬆️ أو Space للقفز (على الهاتف استعمل الأزرار)"
                  : "⬅️ ➡️ Move | ⬆️ or Space Jump (Mobile: use buttons)"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
