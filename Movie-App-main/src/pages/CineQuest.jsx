import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function CineQuest() {
  const { lang } = useLang();

  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [hearts, setHearts] = useState(3);

  // ✅ Player + world states
  const player = useRef({
    x: 60,
    y: 200,
    w: 34,
    h: 44,
    vx: 0,
    vy: 0,
    speed: 4,
    jump: -12,
    grounded: false,
  });

  const keys = useRef({
    left: false,
    right: false,
    jump: false,
  });

  // ✅ Level Map (platforms)
  const level = useRef({
    gravity: 0.6,
    floor: 280,
    scrollX: 0,
    length: 2200,
    platforms: [
      { x: 0, y: 280, w: 600, h: 60 },
      { x: 660, y: 250, w: 140, h: 20 },
      { x: 860, y: 220, w: 160, h: 20 },
      { x: 1110, y: 260, w: 200, h: 20 },
      { x: 1400, y: 230, w: 180, h: 20 },
      { x: 1680, y: 200, w: 220, h: 20 },
      { x: 1950, y: 280, w: 450, h: 60 },
    ],
    enemies: [
      { x: 520, y: 248, w: 28, h: 28, dir: 1 },
      { x: 1120, y: 232, w: 28, h: 28, dir: -1 },
      { x: 1600, y: 172, w: 28, h: 28, dir: 1 },
    ],
    items: [
      { x: 300, y: 240, r: 10, taken: false },
      { x: 720, y: 215, r: 10, taken: false },
      { x: 920, y: 185, r: 10, taken: false },
      { x: 1200, y: 225, r: 10, taken: false },
      { x: 1500, y: 195, r: 10, taken: false },
      { x: 1730, y: 160, r: 10, taken: false },
    ],
    goal: { x: 2100, y: 220, w: 60, h: 60 },
  });

  // ✅ Utility
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

  // ✅ Start
  function startGame() {
    setStarted(true);
    setScore(0);
    setCoins(0);
    setHearts(3);
    setGameOver(false);
    setWin(false);

    player.current = {
      x: 60,
      y: 200,
      w: 34,
      h: 44,
      vx: 0,
      vy: 0,
      speed: 4,
      jump: -12,
      grounded: false,
    };

    level.current.scrollX = 0;
    level.current.items.forEach((i) => (i.taken = false));
  }

  // ✅ Keyboard
  useEffect(() => {
    function down(e) {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w")
        keys.current.jump = true;
    }

    function up(e) {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w")
        keys.current.jump = false;
    }

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ✅ Main Game Loop
  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;

    function loop() {
      if (gameOver || win) return;

      const p = player.current;
      const L = level.current;

      // ✅ Movement
      p.vx = 0;
      if (keys.current.left) p.vx = -p.speed;
      if (keys.current.right) p.vx = p.speed;

      // ✅ Jump
      if (keys.current.jump && p.grounded) {
        p.vy = p.jump;
        p.grounded = false;
      }

      // ✅ Gravity
      p.vy += L.gravity;
      p.y += p.vy;
      p.x += p.vx;

      // ✅ Camera scroll (follow player)
      if (p.x > W / 2) {
        L.scrollX += p.vx;
        p.x = W / 2;
      }

      // ✅ Clamp scroll
      if (L.scrollX < 0) L.scrollX = 0;
      if (L.scrollX > L.length - W) L.scrollX = L.length - W;

      // ✅ Floor collision
      if (p.y + p.h >= L.floor) {
        p.y = L.floor - p.h;
        p.vy = 0;
        p.grounded = true;
      }

      // ✅ Platform collision
      p.grounded = false;
      L.platforms.forEach((plat) => {
        const shifted = { ...plat, x: plat.x - L.scrollX };
        if (rectHit(p, shifted)) {
          // landing only
          if (p.vy > 0 && p.y + p.h - p.vy <= shifted.y) {
            p.y = shifted.y - p.h;
            p.vy = 0;
            p.grounded = true;
          }
        }
      });

      // ✅ Items (coins 🎬)
      L.items.forEach((c) => {
        if (!c.taken) {
          const shifted = { ...c, x: c.x - L.scrollX };
          if (circleHitRect(shifted, p)) {
            c.taken = true;
            setCoins((prev) => prev + 1);
            setScore((prev) => prev + 50);
          }
        }
      });

      // ✅ Enemies
      L.enemies.forEach((e) => {
        e.x += e.dir * 1.2;

        // bounce
        if (e.x < 400 || e.x > 1900) e.dir *= -1;

        const shifted = { ...e, x: e.x - L.scrollX };
        if (rectHit(p, shifted)) {
          setHearts((prev) => {
            if (prev <= 1) {
              setGameOver(true);
              return 0;
            }
            return prev - 1;
          });

          // knockback
          p.x -= 40;
          p.y -= 40;
        }
      });

      // ✅ Goal
      const goalShifted = { ...L.goal, x: L.goal.x - L.scrollX };
      if (rectHit(p, goalShifted)) {
        setWin(true);
        setScore((prev) => prev + 500);
      }

      // ✅ Draw
      ctx.clearRect(0, 0, W, H);

      // background
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, W, H);

      // platforms
      L.platforms.forEach((plat) => {
        const x = plat.x - L.scrollX;
        ctx.fillStyle = "#111";
        ctx.fillRect(x, plat.y, plat.w, plat.h);

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.strokeRect(x, plat.y, plat.w, plat.h);
      });

      // goal
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(goalShifted.x, goalShifted.y, L.goal.w, L.goal.h);
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText("🎥", goalShifted.x + 18, goalShifted.y + 38);

      // coins
      L.items.forEach((c) => {
        if (!c.taken) {
          const x = c.x - L.scrollX;
          ctx.beginPath();
          ctx.fillStyle = "#ffd700";
          ctx.arc(x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.font = "13px Arial";
          ctx.fillText("🎬", x - 10, c.y + 5);
        }
      });

      // enemies
      L.enemies.forEach((e) => {
        const x = e.x - L.scrollX;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x, e.y, e.w, e.h);
        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText("🎭", x - 2, e.y + 20);
      });

      // player
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#fff";
      ctx.font = "18px Arial";
      ctx.fillText("🦸", p.x - 2, p.y + 30);

      // HUD
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.fillText(`Score: ${score}`, 12, 22);
      ctx.fillText(`🎬 ${coins}`, 12, 42);
      ctx.fillText(`❤️ ${hearts}`, 12, 62);

      requestRef.current = requestAnimationFrame(loop);
    }

    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);
  }, [started, score, coins, hearts, gameOver, win]);

  // ✅ Mobile touch controls
  function press(type, v) {
    keys.current[type] = v;
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto pt-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          🎮 CineQuest
        </motion.h1>

        <p className="text-gray-400 mt-3 max-w-3xl">
          {lang === "ar"
            ? "لعبة مغامرات سينمائية — اجمع 🎬، تفادى 🎭، واصل للبوابة 🎥."
            : "A cinematic platformer — collect 🎬, avoid 🎭, and reach 🎥."}
        </p>

        {!started && (
          <div className="mt-8 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold shadow-lg"
            >
              {lang === "ar" ? "ابدأ اللعبة" : "Start Game"}
            </button>

            <p className="text-gray-400 text-sm mt-4">
              {lang === "ar"
                ? "التحكم: ⬅️ ➡️ للحركة، ⬆️ أو Space للقفز"
                : "Controls: ⬅️ ➡️ Move, ⬆️ or Space Jump"}
            </p>
          </div>
        )}

        {started && (
          <div className="mt-8 space-y-4">
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <canvas
                ref={canvasRef}
                width="560"
                height="320"
                className="w-full rounded-2xl border border-white/10"
              />
            </div>

            {/* ✅ Mobile buttons */}
            <div className="flex items-center justify-center gap-3 md:hidden">
              <button
                onTouchStart={() => press("left", true)}
                onTouchEnd={() => press("left", false)}
                className="px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10"
              >
                ⬅️
              </button>

              <button
                onTouchStart={() => press("jump", true)}
                onTouchEnd={() => press("jump", false)}
                className="px-6 py-4 rounded-2xl bg-red-600 border border-white/10"
              >
                ⬆️
              </button>

              <button
                onTouchStart={() => press("right", true)}
                onTouchEnd={() => press("right", false)}
                className="px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10"
              >
                ➡️
              </button>
            </div>

            {gameOver && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
                <h2 className="text-2xl font-bold">
                  {lang === "ar" ? "💥 خسرت!" : "💥 Game Over!"}
                </h2>
                <p className="text-gray-300 mt-2">
                  {lang === "ar"
                    ? "نفذت القلوب! أعد المحاولة."
                    : "No hearts left! Try again."}
                </p>

                <button
                  onClick={startGame}
                  className="mt-4 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition font-semibold"
                >
                  {lang === "ar" ? "إعادة" : "Restart"}
                </button>
              </div>
            )}

            {win && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6">
                <h2 className="text-2xl font-bold">
                  {lang === "ar" ? "🎉 فزت!" : "🎉 You Win!"}
                </h2>
                <p className="text-gray-300 mt-2">
                  {lang === "ar"
                    ? "وصلت للبوابة 🎥! أحسنت."
                    : "You reached the 🎥 portal! Great job."}
                </p>

                <button
                  onClick={startGame}
                  className="mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
                >
                  {lang === "ar" ? "اللعب من جديد" : "Play Again"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
