/* -------cosmos canvas------------------------ */
const canvas = document.getElementById("cosmos");
const ctx = canvas.getContext("2d");

let W, H;
let stars = [];
let nebulas = [];
let shooting = [];
let scrollY = 0;
let t = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 3000,
      r: Math.random() * 1.4 + 0.2,
      o: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

function initNebulas() {
  const colors = [
    "rgba(196,181,253,",
    "rgba(240,196,248,",
    "rgba(165,243,252,",
    "rgba(253,164,175,",
  ];
  nebulas = [];
  for (let i = 0; i < 5; i++) {
    nebulas.push({
      x: Math.random() * 1800,
      y: Math.random() * 2800,
      r: Math.random() * 200 + 80,
      color: colors[Math.floor(Math.random() * colors.length)],
      o: Math.random() * 0.04 + 0.01,
    });
  }
}

function spawnShooting() {
  if (Math.random() < 0.004) {
    shooting.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: Math.random() * 120 + 60,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 5,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // nebulas
  nebulas.forEach((n) => {
    const nx = n.x % W;
    const ny = n.y % H;
    const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
    grd.addColorStop(0, n.color + n.o * 2 + ")");
    grd.addColorStop(1, n.color + "0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // stars
  t += 0.008;
  stars.forEach((s) => {
    const twinkleO = s.o * (0.7 + 0.3 * Math.sin(t * 2 + s.twinkle));
    const sy = (s.y + scrollY * s.speed * 0.15) % H;
    ctx.beginPath();
    ctx.arc(s.x % W, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(233,213,255,${twinkleO})`;
    ctx.fill();
  });

  // shooting stars
  spawnShooting();
  for (let i = shooting.length - 1; i >= 0; i--) {
    const s = shooting[i];
    ctx.save();
    ctx.globalAlpha = s.life * 0.8;
    ctx.strokeStyle = "rgba(240,196,248,0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(
      s.x - Math.cos(s.angle) * s.len,
      s.y - Math.sin(s.angle) * s.len,
    );
    ctx.stroke();
    ctx.restore();
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= s.decay;
    if (s.life <= 0) shooting.splice(i, 1);
  }

  requestAnimationFrame(draw);
}

/* ------------------scroll reveal-------------------------------------- */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 60);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* -----------------init--------------------------------------------- */
resize();
initStars();
initNebulas();
draw();
initReveal();

window.addEventListener("resize", resize);
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});
