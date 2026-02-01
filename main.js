// main.js
// Heart PNG confetti + pastel takeover + background music (user-triggered)

function qs(sel){ return document.querySelector(sel); }
const secretBtn = qs("#secretBtn");

/* ---------------------------
   Background music (SAFE autoplay)
--------------------------- */
let bgMusic = null;

function playMusic() {
  if (bgMusic) return;

  bgMusic = new Audio("assets/music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0;

  bgMusic.play().then(() => {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      bgMusic.volume = Math.min(v, 0.45);
      if (v >= 0.45) clearInterval(fade);
    }, 80);
  }).catch(() => {});
}

/* ---------------------------
   KaTeX auto-render (optional)
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
});

/* ---------------------------
   Celebration layers
--------------------------- */
function ensureCelebrationLayers(){
  let overlay = document.querySelector(".celebrateOverlay");
  if(!overlay){
    overlay = document.createElement("div");
    overlay.className = "celebrateOverlay";
    document.body.appendChild(overlay);
  }

  let cute = document.querySelector(".cuteLayer");
  if(!cute){
    cute = document.createElement("div");
    cute.className = "cuteLayer";
    cute.innerHTML = `
      <img class="c1" src="assets/cute1.png" alt="">
      <img class="c2" src="assets/cute2.png" alt="">
      <img class="c3" src="assets/cute3.png" alt="">
      <img class="c4" src="assets/cute4.png" alt="">
    `;
    document.body.appendChild(cute);
  }

  let msg = document.querySelector(".valentineText");
  if(!msg){
    msg = document.createElement("div");
    msg.className = "valentineText";
    msg.innerHTML = `<div class="line1">Will you be my Valentine?</div>`;
    document.body.appendChild(msg);
  }

  let pour = document.querySelector(".pourLayer");
  if(!pour){
    pour = document.createElement("div");
    pour.className = "pourLayer";
    document.body.appendChild(pour);
  }

  return { overlay, cute, msg, pour };
}

/* ---------------------------
   Heart assets
--------------------------- */
function rand(min, max){ return Math.random() * (max - min) + min; }

const HEARTS = [
  "assets/heart1.png",
  "assets/heart2.png",
  "assets/heart3.png",
  "assets/heart4.png",
];

// preload hearts
HEARTS.forEach(src => { const i = new Image(); i.src = src; });

/* ---------------------------
   Spawn ONE heart
--------------------------- */
function spawnHeart(pour, x, y, opts = {}) {
  const el = document.createElement("div");
  el.className = "particle heartP";

  const img = document.createElement("img");
  img.src = HEARTS[(Math.random() * HEARTS.length) | 0];
  img.alt = "";
  el.appendChild(img);

  const size = opts.size ?? rand(32, 96);
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  pour.appendChild(el);

  const dx = opts.dx ?? rand(-820, 820);
  const dyUp = opts.dyUp ?? rand(140, 720);
  const dyDown = opts.dyDown ?? rand(120, 560);
  const rot = opts.rot ?? rand(-480, 480);
  const dur = opts.dur ?? rand(1200, 2600);

  el.animate(
    [
      { transform: "translate(0,0) rotate(0deg) scale(0.9)", opacity: 0 },
      {
        transform: `translate(${dx * 0.45}px, -${dyUp}px) rotate(${rot * 0.6}deg) scale(1.1)`,
        opacity: 1,
        offset: 0.45
      },
      {
        transform: `translate(${dx}px, ${Math.max(-80, dyDown - dyUp)}px) rotate(${rot}deg) scale(0.95)`,
        opacity: 0
      }
    ],
    {
      duration: dur,
      easing: "cubic-bezier(.18,.9,.25,1)",
      fill: "forwards"
    }
  );

  setTimeout(() => el.remove(), dur + 150);
}

/* ---------------------------
   Big center burst
   3 pops (2s apart),
   wait 8s AFTER pop #3 ends,
   repeat sequence once
--------------------------- */
function burstHeartsFromMiddle(){
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  const { pour } = ensureCelebrationLayers();

  const W = window.innerWidth;
  const H = window.innerHeight;

  const x0 = W * 0.5;
  const y0 = H * 0.60;

  const burstCount = 420;
  const streamCount = 220;

  const popsPerSequence = 3;
  const popGapMs = 2000;       // 2s between pop starts
  const sequenceGapMs = 8000;  // ⬅️ NOW 8 seconds
  const sequences = 2;

  const popSpawnStepMs = 1;
  const popEmitDuration = burstCount * popSpawnStepMs;

  let t = 0;

  for (let s = 0; s < sequences; s++) {
    for (let p = 0; p < popsPerSequence; p++) {
      const popStart = t + p * popGapMs;

      for (let i = 0; i < burstCount; i++){
        setTimeout(() => {
          spawnHeart(
            pour,
            x0 + rand(-90, 90),
            y0 + rand(-90, 90),
            {
              dx: rand(-900, 900),
              dyUp: rand(120, 760),
              dyDown: rand(140, 580),
              size: rand(34, 104),
              rot: rand(-520, 520),
            }
          );
        }, popStart + i * popSpawnStepMs);
      }
    }

    const thirdPopStart = t + (popsPerSequence - 1) * popGapMs;
    const thirdPopEnd = thirdPopStart + popEmitDuration;

    t = thirdPopEnd + sequenceGapMs;
  }

  // FOLLOW-UP stream
  const followUpStart = t;

  for (let i = 0; i < streamCount; i++){
    setTimeout(() => {
      spawnHeart(
        pour,
        x0 + rand(-100, 100),
        y0 + rand(-100, 100),
        {
          dx: rand(-840, 840),
          dyUp: rand(120, 660),
          dyDown: rand(160, 520),
          size: rand(30, 96),
          rot: rand(-500, 500),
        }
      );
    }, followUpStart + i * 6);
  }
}

/* ---------------------------
   Start celebration
--------------------------- */
let hasCelebrated = false;

function startCelebration(){
  ensureCelebrationLayers();
  document.body.classList.add("isCelebrating");

  playMusic();
  burstHeartsFromMiddle();

  if (secretBtn) {
    secretBtn.style.opacity = "0";
    secretBtn.style.pointerEvents = "none";
  }
}

secretBtn?.addEventListener("click", () => {
  if (hasCelebrated) return;
  hasCelebrated = true;
  startCelebration();
});
