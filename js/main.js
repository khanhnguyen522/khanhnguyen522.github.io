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

/* -----------------projects carousel--------------------------------- */
function initProjectCarousel() {
  const track = document.getElementById("projTrack");
  const dotsWrap = document.getElementById("projDots");
  const prevBtn = document.querySelector(".arrow-prev");
  const nextBtn = document.querySelector(".arrow-next");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);

  // build dot indicators
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "proj-dot";
    dot.setAttribute("aria-label", `Go to project ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function setActive(index) {
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function nearestIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    cards[clamped].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  // keep dots synced while the track scrolls (swipe, drag, or arrow keys)
  let scrollRAF;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => setActive(nearestIndex()));
  });

  prevBtn?.addEventListener("click", () => goTo(nearestIndex() - 1));
  nextBtn?.addEventListener("click", () => goTo(nearestIndex() + 1));

  // desktop click-and-drag swipe (touch devices already get native swipe)
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return; // touch gets native scrolling, untouched
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) dragged = true;
    if (dragged) track.scrollLeft = startScroll - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    if (dragged) goTo(nearestIndex());
  }
  window.addEventListener("pointerup", endDrag);

  // stop a dragged swipe from also firing the card's link
  track.addEventListener(
    "click",
    (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    },
    true,
  );

  // keyboard support when the carousel is focused
  track.setAttribute("tabindex", "0");
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(nearestIndex() + 1);
    else if (e.key === "ArrowLeft") goTo(nearestIndex() - 1);
  });

  setActive(0);
}

/* -----------------init--------------------------------------------- */
resize();
initStars();
initNebulas();
draw();
initReveal();
initProjectCarousel();

window.addEventListener("resize", resize);
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});
